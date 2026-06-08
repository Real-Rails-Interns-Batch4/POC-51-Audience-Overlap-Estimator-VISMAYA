from fastapi import APIRouter
from app.api.endpoints import channels, overlap, reach, media_plan

api_router = APIRouter()
api_router.include_router(channels.router, prefix="/channels", tags=["channels"])
api_router.include_router(overlap.router, prefix="/overlap", tags=["overlap"])
api_router.include_router(reach.router, prefix="/reach", tags=["reach"])
api_router.include_router(media_plan.router, prefix="/media-plan", tags=["media-plan"])
