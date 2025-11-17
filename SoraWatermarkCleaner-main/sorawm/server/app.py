from fastapi import FastAPI

from sorawm.server.lifespan import lifespan
from sorawm.server.router import router


def init_app():
    app = FastAPI(lifespan=lifespan)
    app.include_router(router)
    return app
