from fastapi import APIRouter
from app.schemas.request import OverlapRequest
from app.schemas.response import OverlapResponse
from app.services.overlap_service import get_overlap_metrics

router = APIRouter()

@router.post("", response_model=OverlapResponse)
def calculate_overlap(payload: OverlapRequest):
    return get_overlap_metrics(payload)
