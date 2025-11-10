#!/usr/bin/env python3
"""
Batch API for processing multiple videos simultaneously
Supports up to 20 concurrent video processing jobs
"""

import asyncio
import json
import os
import tempfile
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict, List, Optional

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from loguru import logger
from pydantic import BaseModel

from sorawm.batch_video_processor import BatchVideoProcessor, process_videos_batch

app = FastAPI(title="Watermark Batch API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global batch processor instance
batch_processor = BatchVideoProcessor(
    max_concurrent_videos=20, max_workers_per_video=2, temp_base_dir="tmp_batch_api"
)

# Storage for batch jobs
batch_jobs: Dict[str, Dict] = {}
jobs_lock = threading.Lock()


# Models
class BatchJobRequest(BaseModel):
    videos: List[str]  # List of video file names to process
    priority: int = 1
    metadata: Optional[Dict] = None


class BatchJobResponse(BaseModel):
    batch_id: str
    status: str
    total_videos: int
    message: str


class BatchStatusResponse(BaseModel):
    batch_id: str
    status: str
    progress: float
    completed: int
    total: int
    failed: int
    eta_seconds: float
    concurrent_active: int
    results: Optional[List[Dict]] = None


# Temporary file storage
temp_storage = Path("tmp_api_storage")
temp_storage.mkdir(exist_ok=True)


def progress_callback(batch_id: str, info: Dict):
    """Callback to update batch job progress"""
    with jobs_lock:
        if batch_id in batch_jobs:
            batch_jobs[batch_id].update(
                {
                    "progress": info["progress"],
                    "completed": info["completed"],
                    "total": info["total"],
                    "failed": info["failed"],
                    "eta_seconds": info["eta_seconds"],
                    "concurrent_active": info["concurrent_active"],
                    "last_updated": time.time(),
                }
            )


@app.post("/api/batch/upload_videos", response_model=Dict)
async def upload_videos(files: List[UploadFile] = File(...)):
    """
    Upload multiple videos for batch processing
    Maximum 20 videos per batch
    """
    if len(files) > 20:
        raise HTTPException(
            status_code=400, detail="Maximum 20 videos allowed per batch"
        )

    uploaded_files = []
    batch_id = str(uuid.uuid4())
    batch_dir = temp_storage / f"batch_{batch_id}"
    batch_dir.mkdir(exist_ok=True)

    try:
        for file in files:
            if not file.content_type or not file.content_type.startswith("video/"):
                raise HTTPException(
                    status_code=400, detail=f"File {file.filename} is not a video"
                )

            # Save uploaded file
            file_path = batch_dir / file.filename
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)

            uploaded_files.append(
                {
                    "filename": file.filename,
                    "path": str(file_path),
                    "size": len(content),
                }
            )

        logger.info(f"📦 Uploaded {len(uploaded_files)} videos for batch {batch_id}")

        return {
            "batch_id": batch_id,
            "uploaded_files": uploaded_files,
            "total_videos": len(uploaded_files),
            "status": "uploaded",
        }

    except Exception as e:
        logger.error(f"Error uploading videos for batch {batch_id}: {e}")
        # Cleanup on error
        import shutil

        if batch_dir.exists():
            shutil.rmtree(batch_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/batch/submit", response_model=BatchJobResponse)
async def submit_batch_job(batch_id: str = Form(...), priority: int = Form(1)):
    """
    Submit a batch job for processing
    """
    batch_dir = temp_storage / f"batch_{batch_id}"
    if not batch_dir.exists():
        raise HTTPException(status_code=404, detail="Batch not found")

    # Find all video files in the batch directory
    video_files = []
    for ext in [".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm"]:
        video_files.extend(batch_dir.glob(f"*{ext}"))

    if not video_files:
        raise HTTPException(status_code=400, detail="No video files found in batch")

    # Create output directory
    output_dir = batch_dir / "cleaned"
    output_dir.mkdir(exist_ok=True)

    # Create video pairs for processing
    video_pairs = []
    for video_file in video_files:
        output_file = output_dir / f"cleaned_{video_file.name}"
        video_pairs.append((str(video_file), str(output_file)))

    # Initialize batch job status
    with jobs_lock:
        batch_jobs[batch_id] = {
            "batch_id": batch_id,
            "status": "PROCESSING",
            "progress": 0.0,
            "completed": 0,
            "total": len(video_pairs),
            "failed": 0,
            "eta_seconds": 0,
            "concurrent_active": min(20, len(video_pairs)),
            "video_pairs": video_pairs,
            "output_dir": str(output_dir),
            "created_at": time.time(),
            "last_updated": time.time(),
            "priority": priority,
        }

    # Start processing in background
    asyncio.create_task(process_batch_async(batch_id, video_pairs, priority))

    logger.info(f"🚀 Started batch job {batch_id} with {len(video_pairs)} videos")

    return BatchJobResponse(
        batch_id=batch_id,
        status="PROCESSING",
        total_videos=len(video_pairs),
        message=f"Batch job started with {len(video_pairs)} videos",
    )


async def process_batch_async(batch_id: str, video_pairs: List[tuple], priority: int):
    """
    Process batch job asynchronously
    """
    try:
        # Create a callback for this specific batch
        def batch_progress_callback(info):
            progress_callback(batch_id, info)

        # Process the batch
        results = await asyncio.get_event_loop().run_in_executor(
            None,
            process_videos_batch,
            video_pairs,
            20,  # max_concurrent
            2,  # workers_per_video
            batch_progress_callback,
        )

        # Update final status and create ZIP
        with jobs_lock:
            if batch_id in batch_jobs:
                job = batch_jobs[batch_id]
                output_dir = Path(job["output_dir"])

                # Auto-create ZIP file when batch completes
                zip_path = None
                if results["success"] and output_dir.exists():
                    try:
                        import zipfile

                        zip_path = output_dir.parent / f"batch_{batch_id}_complete.zip"

                        with zipfile.ZipFile(
                            zip_path, "w", zipfile.ZIP_DEFLATED
                        ) as zipf:
                            for video_file in output_dir.glob("*.mp4"):
                                zipf.write(video_file, video_file.name)

                        logger.info(f"📦 ZIP créé automatiquement: {zip_path}")
                    except Exception as e:
                        logger.error(f"Erreur création ZIP: {e}")
                        zip_path = None

                batch_jobs[batch_id].update(
                    {
                        "status": "COMPLETED" if results["success"] else "FAILED",
                        "progress": 100.0,
                        "results": results,
                        "zip_ready": zip_path is not None,
                        "zip_path": str(zip_path) if zip_path else None,
                        "last_updated": time.time(),
                    }
                )

        logger.info(f"✅ Batch job {batch_id} completed successfully")

    except Exception as e:
        logger.error(f"❌ Batch job {batch_id} failed: {e}")

        with jobs_lock:
            if batch_id in batch_jobs:
                batch_jobs[batch_id].update(
                    {"status": "FAILED", "error": str(e), "last_updated": time.time()}
                )


@app.get("/api/batch/status/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str):
    """
    Get the status of a batch job
    """
    with jobs_lock:
        if batch_id not in batch_jobs:
            raise HTTPException(status_code=404, detail="Batch job not found")

        job = batch_jobs[batch_id].copy()

    return BatchStatusResponse(
        batch_id=batch_id,
        status=job["status"],
        progress=job.get("progress", 0.0),
        completed=job.get("completed", 0),
        total=job.get("total", 0),
        failed=job.get("failed", 0),
        eta_seconds=job.get("eta_seconds", 0),
        concurrent_active=job.get("concurrent_active", 0),
        results=job.get("results"),
    )


@app.get("/api/batch/download/{batch_id}")
async def download_batch_results(batch_id: str):
    """
    Download all processed videos as a zip file
    """
    with jobs_lock:
        if batch_id not in batch_jobs:
            raise HTTPException(status_code=404, detail="Batch job not found")

        job = batch_jobs[batch_id]
        if job["status"] != "COMPLETED":
            raise HTTPException(
                status_code=400,
                detail=f"Batch job not completed (status: {job['status']})",
            )

        # Check if ZIP already exists
        if job.get("zip_ready") and job.get("zip_path"):
            zip_path = Path(job["zip_path"])
            if zip_path.exists():
                return FileResponse(
                    path=zip_path,
                    filename=f"watermarks_removed_{batch_id}.zip",
                    media_type="application/zip",
                )

        output_dir = Path(job["output_dir"])

    if not output_dir.exists():
        raise HTTPException(status_code=404, detail="Output directory not found")

    # Create zip file on-demand if not already created
    import zipfile

    zip_path = output_dir.parent / f"batch_{batch_id}_results.zip"

    try:
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for video_file in output_dir.glob("*.mp4"):
                zipf.write(video_file, video_file.name)

        return FileResponse(
            path=zip_path,
            filename=f"watermarks_removed_{batch_id}.zip",
            media_type="application/zip",
        )

    except Exception as e:
        logger.error(f"Error creating zip for batch {batch_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create zip file")


@app.get("/api/batch/download/{batch_id}/{filename}")
async def download_single_video(batch_id: str, filename: str):
    """
    Download a single processed video from a batch
    """
    with jobs_lock:
        if batch_id not in batch_jobs:
            raise HTTPException(status_code=404, detail="Batch job not found")

        job = batch_jobs[batch_id]
        output_dir = Path(job["output_dir"])

    video_path = output_dir / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")

    return FileResponse(path=video_path, filename=filename, media_type="video/mp4")


@app.get("/api/batch/list")
async def list_batch_jobs():
    """
    List all batch jobs
    """
    with jobs_lock:
        jobs = []
        for batch_id, job in batch_jobs.items():
            jobs.append(
                {
                    "batch_id": batch_id,
                    "status": job["status"],
                    "total_videos": job["total"],
                    "completed": job.get("completed", 0),
                    "failed": job.get("failed", 0),
                    "progress": job.get("progress", 0.0),
                    "created_at": job.get("created_at"),
                    "last_updated": job.get("last_updated"),
                }
            )

    return {"batch_jobs": jobs}


@app.delete("/api/batch/{batch_id}")
async def delete_batch_job(batch_id: str):
    """
    Delete a batch job and its files
    """
    with jobs_lock:
        if batch_id not in batch_jobs:
            raise HTTPException(status_code=404, detail="Batch job not found")

        del batch_jobs[batch_id]

    # Cleanup files
    batch_dir = temp_storage / f"batch_{batch_id}"
    if batch_dir.exists():
        import shutil

        shutil.rmtree(batch_dir, ignore_errors=True)

    return {"message": f"Batch job {batch_id} deleted successfully"}


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "active_batches": len(batch_jobs),
        "max_concurrent_videos": 20,
    }


@app.get("/api/stats")
async def get_stats():
    """
    Get API statistics
    """
    with jobs_lock:
        total_jobs = len(batch_jobs)
        completed_jobs = len(
            [j for j in batch_jobs.values() if j["status"] == "COMPLETED"]
        )
        processing_jobs = len(
            [j for j in batch_jobs.values() if j["status"] == "PROCESSING"]
        )
        failed_jobs = len([j for j in batch_jobs.values() if j["status"] == "FAILED"])

        total_videos = sum(j["total"] for j in batch_jobs.values())
        completed_videos = sum(j.get("completed", 0) for j in batch_jobs.values())

    return {
        "batch_jobs": {
            "total": total_jobs,
            "completed": completed_jobs,
            "processing": processing_jobs,
            "failed": failed_jobs,
        },
        "videos": {"total": total_videos, "completed": completed_videos},
        "system": {"max_concurrent_videos": 20, "max_workers_per_video": 2},
    }


@app.get("/api/batch/zip_ready/{batch_id}")
async def check_zip_ready(batch_id: str):
    """
    Check if ZIP file is ready for download
    """
    with jobs_lock:
        if batch_id not in batch_jobs:
            raise HTTPException(status_code=404, detail="Batch job not found")

        job = batch_jobs[batch_id]

    return {
        "batch_id": batch_id,
        "zip_ready": job.get("zip_ready", False),
        "zip_path": job.get("zip_path"),
        "status": job["status"],
        "completed": job.get("completed", 0),
        "total": job.get("total", 0),
    }


@app.get("/api/batch/auto_download/{batch_id}")
async def auto_download_zip(batch_id: str):
    """
    Auto-download ZIP when batch completes (triggered by frontend)
    """
    with jobs_lock:
        if batch_id not in batch_jobs:
            raise HTTPException(status_code=404, detail="Batch job not found")

        job = batch_jobs[batch_id]

    if job["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Batch not completed yet")

    if not job.get("zip_ready"):
        raise HTTPException(status_code=404, detail="ZIP not ready yet")

    zip_path = Path(job["zip_path"])
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="ZIP file not found")

    return FileResponse(
        path=zip_path,
        filename=f"watermarks_removed_{len(job.get('completed', 0))}videos.zip",
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=watermarks_removed.zip"},
    )


if __name__ == "__main__":
    logger.info("🚀 Starting Watermark Batch API")
    logger.info(f"📁 Temp storage: {temp_storage}")
    logger.info("💡 Endpoints available:")
    logger.info("  POST /api/batch/upload_videos - Upload videos")
    logger.info("  POST /api/batch/submit - Submit batch job")
    logger.info("  GET  /api/batch/status/{batch_id} - Get status")
    logger.info("  GET  /api/batch/download/{batch_id} - Download results")
    logger.info("  GET  /api/batch/zip_ready/{batch_id} - Check ZIP ready")
    logger.info("  GET  /api/batch/auto_download/{batch_id} - Auto download ZIP")
    logger.info("  GET  /api/batch/list - List all jobs")
    logger.info("  GET  /api/stats - Get statistics")

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
