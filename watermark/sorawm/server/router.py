import tempfile
import zipfile
from pathlib import Path
from typing import Optional
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from sorawm.server.schemas import WMRemoveResults
from sorawm.server.worker import worker

router = APIRouter()


class CancelTasksRequest(BaseModel):
    task_ids: list[str]


async def process_upload_and_queue(
    task_id: str, video_content: bytes, video_path: Path
):
    try:
        async with aiofiles.open(video_path, "wb") as f:
            await f.write(video_content)
        await worker.queue_task(task_id, video_path)
    except Exception as e:
        await worker.mark_task_error(task_id, str(e))


@router.post("/submit_remove_task")
async def submit_remove_task(
    background_tasks: BackgroundTasks, video: UploadFile = File(...)
):
    task_id = await worker.create_task()
    content = await video.read()
    upload_filename = f"{uuid4()}_{video.filename}"
    video_path = worker.upload_dir / upload_filename
    background_tasks.add_task(process_upload_and_queue, task_id, content, video_path)

    return {"task_id": task_id, "message": "Task submitted."}


@router.get("/get_results")
async def get_results(remove_task_id: str) -> WMRemoveResults:
    result = await worker.get_task_status(remove_task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task does not exist.")

    return result


@router.get("/download/{task_id}")
async def download_video(task_id: str):
    result = await worker.get_task_status(task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task does not exist.")
    if result.status != "FINISHED":
        raise HTTPException(
            status_code=400, detail=f"Task not finish yet: {result.status}"
        )
    output_path = await worker.get_output_path(task_id)
    if output_path is None or not output_path.exists():
        raise HTTPException(status_code=404, detail="Output file does not exits")

    return FileResponse(
        path=output_path, filename=output_path.name, media_type="video/mp4"
    )


@router.post("/cancel_tasks")
async def cancel_tasks(payload: CancelTasksRequest):
    await worker.cancel_tasks(payload.task_ids)
    return {"cancelled": len(payload.task_ids)}


@router.get("/download_batch_zip")
async def download_batch_zip(
    tasks: str = Query(..., description="Comma-separated task IDs"),
):
    """
    Download multiple completed videos as a ZIP file
    Usage: /download_batch_zip?tasks=task1,task2,task3
    """
    task_ids = [t.strip() for t in tasks.split(",") if t.strip()]

    if not task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")

    if len(task_ids) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 videos per ZIP")

    # Validate all tasks are completed
    video_files = []
    for task_id in task_ids:
        result = await worker.get_task_status(task_id)
        if result is None:
            raise HTTPException(
                status_code=404, detail=f"Task {task_id} does not exist"
            )
        if result.status != "FINISHED":
            raise HTTPException(
                status_code=400,
                detail=f"Task {task_id} not finished yet: {result.status}",
            )

        output_path = await worker.get_output_path(task_id)
        if output_path is None or not output_path.exists():
            raise HTTPException(
                status_code=404, detail=f"Output file for task {task_id} does not exist"
            )

        video_files.append((task_id, output_path))

    # Create temporary ZIP file
    temp_zip = Path(tempfile.mktemp(suffix=".zip"))

    try:
        with zipfile.ZipFile(temp_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
            for i, (task_id, video_path) in enumerate(video_files):
                # Use original filename if available, otherwise use task_id
                filename = f"cleaned_video_{i + 1:02d}_{video_path.name}"
                zipf.write(video_path, filename)

        return FileResponse(
            path=temp_zip,
            filename=f"watermarks_removed_{len(video_files)}_videos.zip",
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename=watermarks_removed_{len(video_files)}_videos.zip"
            },
        )

    except Exception as e:
        # Cleanup temp file on error
        if temp_zip.exists():
            temp_zip.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to create ZIP: {str(e)}")
