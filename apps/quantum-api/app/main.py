from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, runs, templates
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.infrastructure.persistence.base import Base
    from app.infrastructure.persistence.database import engine

    import app.infrastructure.persistence.models  # noqa: F401 - register ORM tables

    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Failed to initialize database tables: {e}")
    yield


app = FastAPI(
    title="Quantum Ops Lab API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(templates.router)
app.include_router(runs.router)
