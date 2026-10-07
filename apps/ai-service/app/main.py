from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.review import router as review_router
from .core.config import settings

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="High-precision code review analysis engine for PRReviewPilot",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "prreviewpilot-ai-service",
        "model": settings.openai_model,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
