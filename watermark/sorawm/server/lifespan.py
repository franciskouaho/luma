from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from sorawm.server.db import init_db
from sorawm.server.worker import worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")

    await init_db()
    logger.info("Database initialized")

    await worker.initialize()
    worker.start()

    logger.info("Application started successfully")

    yield

    logger.info("Shutting down...")
    await worker.stop()
    logger.info("Application shutdown complete")
