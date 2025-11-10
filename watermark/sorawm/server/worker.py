import asyncio
import os
from asyncio import Queue
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from loguru import logger
from sqlalchemy import select

from sorawm.configs import WORKING_DIR
from sorawm.core import SoraWM
from sorawm.server.db import get_session
from sorawm.server.models import Task
from sorawm.server.schemas import Status, WMRemoveResults


class WMRemoveTaskWorker:
    def __init__(self, concurrency: int = 1) -> None:
        self.queue = Queue()
        self.concurrency = max(1, concurrency)
        self._worker_tasks: list[asyncio.Task] = []
        self.sora_wm = None
        self.output_dir = WORKING_DIR
        self.upload_dir = WORKING_DIR / "uploads"
        self.upload_dir.mkdir(exist_ok=True, parents=True)
        self.cancelled_tasks: set[str] = set()

    async def initialize(self):
        logger.info("Initializing SoraWM models...")
        self.sora_wm = SoraWM()
        logger.info("SoraWM models initialized")

    async def create_task(self) -> str:
        task_uuid = str(uuid4())
        async with get_session() as session:
            task = Task(
                id=task_uuid,
                video_path="",  # 暂时为空，后续会更新
                status=Status.UPLOADING,
                percentage=0,
            )
            session.add(task)
        logger.info(f"Task {task_uuid} created with UPLOADING status")
        return task_uuid

    async def queue_task(self, task_id: str, video_path: Path):
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one()
            task.video_path = str(video_path)
            if task_id not in self.cancelled_tasks:
                task.status = Status.PROCESSING
                task.percentage = 0

        if task_id in self.cancelled_tasks:
            logger.info(f"Task {task_id} was cancelled before entering the queue.")
            await self._mark_task_cancelled(task_id)
            self.cancelled_tasks.discard(task_id)
            return

        self.queue.put_nowait((task_id, video_path))
        logger.info(f"Task {task_id} queued for processing: {video_path}")

    async def mark_task_error(self, task_id: str, error_msg: str):
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()
            if task:
                task.status = Status.ERROR
                task.percentage = 0
        logger.error(f"Task {task_id} marked as ERROR: {error_msg}")

    async def _mark_task_cancelled(self, task_id: str):
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()
            if task is None:
                return
            if task.status in (Status.FINISHED, Status.ERROR, Status.CANCELLED):
                return
            video_path_str = task.video_path
            output_path_str = task.output_path
            task.status = Status.CANCELLED
            task.percentage = 0
            task.download_url = None

        for path_str in (video_path_str, output_path_str):
            if path_str:
                try:
                    Path(path_str).unlink(missing_ok=True)
                except Exception as exc:
                    logger.warning(
                        f"Unable to delete file {path_str} for task {task_id}: {exc}"
                    )
        logger.info(f"Task {task_id} marked as CANCELLED.")

    async def cancel_tasks(self, task_ids: list[str]):
        if not task_ids:
            return
        for task_id in task_ids:
            self.cancelled_tasks.add(task_id)
        for task_id in task_ids:
            await self._mark_task_cancelled(task_id)

    def start(self):
        if self._worker_tasks:
            return
        logger.info(
            f"Starting {self.concurrency} worker coroutine(s) for video processing."
        )
        for idx in range(self.concurrency):
            self._worker_tasks.append(
                asyncio.create_task(self._worker_loop(idx), name=f"wm-worker-{idx}")
            )

    async def stop(self):
        if not self._worker_tasks:
            return
        logger.info("Stopping worker coroutines...")
        for task in self._worker_tasks:
            task.cancel()
        await asyncio.gather(*self._worker_tasks, return_exceptions=True)
        self._worker_tasks.clear()
        logger.info("Worker coroutines stopped.")

    async def _worker_loop(self, worker_index: int):
        logger.info(f"Worker coroutine #{worker_index} started, waiting for tasks...")
        while True:
            task_uuid, video_path = await self.queue.get()
            logger.info(
                f"[Worker {worker_index}] Processing task {task_uuid}: {video_path}"
            )

            try:
                if task_uuid in self.cancelled_tasks:
                    logger.info(
                        f"Skipping cancelled task {task_uuid} before processing."
                    )
                    await self._mark_task_cancelled(task_uuid)
                    self.cancelled_tasks.discard(task_uuid)
                    continue

                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                file_suffix = video_path.suffix
                output_filename = f"{task_uuid}_{timestamp}{file_suffix}"
                output_path = self.output_dir / output_filename

                async with get_session() as session:
                    result = await session.execute(
                        select(Task).where(Task.id == task_uuid)
                    )
                    task = result.scalar_one()
                    task.status = Status.PROCESSING
                    task.percentage = 0  # Commence à 0% au lieu de 10%

                loop = asyncio.get_event_loop()

                def progress_callback(
                    percentage: int,
                    task_id: str = task_uuid,
                    loop_ref: asyncio.AbstractEventLoop = loop,
                ):
                    asyncio.run_coroutine_threadsafe(
                        self._update_progress(task_id, percentage), loop_ref
                    )

                def cancellation_check(task_id: str = task_uuid) -> bool:
                    """Retourne True si la tâche doit être annulée"""
                    return task_id in self.cancelled_tasks

                if task_uuid in self.cancelled_tasks:
                    logger.info(
                        f"Cancellation detected before executing task {task_uuid}."
                    )
                    await self._mark_task_cancelled(task_uuid)
                    self.cancelled_tasks.discard(task_uuid)
                    continue

                await asyncio.to_thread(
                    self.sora_wm.run,
                    video_path,
                    output_path,
                    progress_callback,
                    False,  # quiet
                    cancellation_check,
                )

                if task_uuid in self.cancelled_tasks:
                    logger.info(
                        f"Cancellation detected after processing task {task_uuid}. Cleaning up."
                    )
                    await self._mark_task_cancelled(task_uuid)
                    self.cancelled_tasks.discard(task_uuid)
                    continue

                async with get_session() as session:
                    result = await session.execute(
                        select(Task).where(Task.id == task_uuid)
                    )
                    task = result.scalar_one()
                    task.status = Status.FINISHED
                    task.percentage = 100
                    task.output_path = str(output_path)
                    task.download_url = f"/download/{task_uuid}"

                logger.info(
                    f"[Worker {worker_index}] Task {task_uuid} completed successfully, output: {output_path}"
                )

            except InterruptedError:
                logger.info(f"Task {task_uuid} was cancelled during processing")
                await self._mark_task_cancelled(task_uuid)
                self.cancelled_tasks.discard(task_uuid)

            except Exception as e:
                logger.error(f"Error processing task {task_uuid}: {e}")
                async with get_session() as session:
                    result = await session.execute(
                        select(Task).where(Task.id == task_uuid)
                    )
                    task = result.scalar_one()
                    task.status = Status.ERROR
                    task.percentage = 0

            finally:
                self.queue.task_done()

    async def _update_progress(self, task_id: str, percentage: int):
        try:
            async with get_session() as session:
                result = await session.execute(select(Task).where(Task.id == task_id))
                task = result.scalar_one_or_none()
                if task:
                    task.percentage = percentage
                    await session.flush()  # Force l'écriture immédiate
                    logger.debug(f"Task {task_id} progress updated to {percentage}%")
        except Exception as e:
            logger.error(f"Error updating progress for task {task_id}: {e}")

    async def get_task_status(self, task_id: str) -> WMRemoveResults | None:
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()
            if task is None:
                return None
            return WMRemoveResults(
                percentage=task.percentage,
                status=Status(task.status),
                download_url=task.download_url,
            )

    async def get_output_path(self, task_id: str) -> Path | None:
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()
            if task is None or task.output_path is None:
                return None
            return Path(task.output_path)


def _resolve_concurrency() -> int:
    value = os.getenv(
        "SORA_WORKER_CONCURRENCY", "4"
    )  # Augmenté de 2 à 4 workers parallèles
    try:
        parsed = int(value)
        return parsed if parsed > 0 else 1
    except ValueError:
        logger.warning(
            "Invalid SORA_WORKER_CONCURRENCY value '{}'. Falling back to 4.", value
        )
        return 4  # Fallback à 4 au lieu de 1


worker = WMRemoveTaskWorker(concurrency=_resolve_concurrency())
