from fastapi import APIRouter
from app.schemas.response import ChannelsResponse, ChannelInfo, ChannelFilterMetadata

router = APIRouter()

@router.get("", response_model=ChannelsResponse)
def get_channels():
    return ChannelsResponse(
        channels=[
            ChannelInfo(
                id="linkedin",
                name="LinkedIn",
                filters=ChannelFilterMetadata(
                    industries=["Tech", "Finance", "Healthcare", "Education", "Marketing"],
                    regions=["US", "EU", "APAC", "LATAM"]
                )
            ),
            ChannelInfo(
                id="gdelt",
                name="GDELT",
                filters=ChannelFilterMetadata(
                    categories=["Technology", "Politics", "Business", "Science", "Entertainment"],
                    regions=["US", "EU", "APAC", "LATAM"]
                )
            )
        ]
    )
