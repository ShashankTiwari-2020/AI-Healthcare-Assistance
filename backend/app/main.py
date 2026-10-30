
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.api.reports import router as reports_router
from app.models import User
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediConnect AI",
    description="AI-powered multilingual healthcare assistance platform",
    version="1.0.0",
)

# Allow the local React frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {
        "message": "AI Healthcare Assistance Platform API is running"
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Healthcare Assistance Platform",
    }
