from fastapi import APIRouter, HTTPException, Header
from ..schemas.review import ReviewRequest, ReviewResponse
from ..agents.review_agent import analyze_code_review

router = APIRouter(prefix="/api/v1/review", tags=["Review"])

@router.post("/analyze", response_model=ReviewResponse)
def analyze_diff(req: ReviewRequest):
    try:
        return analyze_code_review(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
