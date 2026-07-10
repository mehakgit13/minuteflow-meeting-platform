import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers.meetings import router as meetings_router
from .schemas import HealthResponse
from .seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    yield


tags_metadata = [
    {
        "name": "System",
        "description": "Service health and availability endpoints.",
    },
    {
        "name": "Meetings",
        "description": (
            "Browse, search, create, update, upload, and delete meetings. "
            "Meeting responses include participants, topics, transcript segments, summaries, and action items."
        ),
    },
    {
        "name": "Action Items",
        "description": "Create, edit, complete, reopen, and delete meeting tasks.",
    },
]

app = FastAPI(
    title="MinuteFlow API",
    version="1.1.0",
    summary="Meeting notes, transcript, summary, and task management API",
    description=(
        "MinuteFlow is a Fireflies-inspired meeting intelligence API built with FastAPI, "
        "SQLAlchemy, and SQLite. It supports meeting CRUD, transcript upload and parsing, "
        "search and filters, generated summaries and topics, and full action-item management.\n\n"
        "**Authentication:** mocked for this assignment; requests assume a default logged-in user.\n\n"
        "**Transcription:** real-time speech-to-text is outside scope. Upload `.txt`, `.vtt`, or `.srt` files, "
        "or paste transcript text when creating a meeting."
    ),
    contact={
        "name": "Mehak Yadav",
        "email": "mehak.yadav.ug23@nsut.ac.in",
    },
    license_info={
        "name": "Original assignment project",
    },
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings_router, prefix="/api")


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Check API health",
    description="Returns service metadata when the API process and database initialization are available.",
    operation_id="health_check",
)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="MinuteFlow API", version="1.1.0")
