from fastapi import APIRouter
from app.schemas.request import ReachRequest
from app.schemas.response import ReachResponse
from app.services.reach_service import get_reach_metrics

router = APIRouter()

@router.post("", response_model=ReachResponse)
def calculate_reach(payload: ReachRequest):
    return get_reach_metrics(payload)
