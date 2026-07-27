"""Duolingo Clone API — FastAPI + SQLite.

Endpoints are all prefixed with /api and mirror the earlier Next.js implementation exactly,
so the frontend continues to work by pointing at /api/*.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .seed import init_db
from .routes.user import router as user_router
from .routes.course import router as course_router
from .routes.game import router as game_router
from .routes.tutor import router as tutor_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title='Duolingo Clone API', version='1.0.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(',')],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(user_router)
app.include_router(course_router)
app.include_router(game_router)
app.include_router(tutor_router)


@app.get('/api/health')
async def health():
    return {'ok': True, 'name': 'Duolingo Clone API', 'stack': 'FastAPI + SQLite'}
