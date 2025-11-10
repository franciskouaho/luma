import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sorawm.server.lifespan import lifespan
from sorawm.server.router import router


def init_app():
    app = FastAPI(lifespan=lifespan)
    allowed_origins_env = os.getenv("SORA_ALLOWED_ORIGINS", "*")
    allowed_origins = [
        origin.strip()
        for origin in allowed_origins_env.split(",")
        if origin.strip()
    ] or ["*"]
    allow_all = "*" in allowed_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all else allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)
    return app
