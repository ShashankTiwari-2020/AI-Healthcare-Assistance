from fastapi import FastAPI

app = FastAPI(
    title="AI Healthcare Assistance Platform",
    description="AI-powered multilingual healthcare assistance platform",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "AI Healthcare Assistance Platform API is running"
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Healthcare Assistance Platform"
    }