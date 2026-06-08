from pydantic import BaseModel
from typing import List, Dict, Optional

class ChannelFilterMetadata(BaseModel):
    industries: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    regions: List[str]

class ChannelInfo(BaseModel):
    id: str
    name: str
    filters: ChannelFilterMetadata

class ChannelsResponse(BaseModel):
    channels: List[ChannelInfo]

class OverlapResponse(BaseModel):
    linkedin_total: int
    gdelt_total: int
    overlap_total: int
    union_total: int
    jaccard_similarity: float

class ReachPoint(BaseModel):
    budget: float
    linkedin_reach: float
    gdelt_reach: float
    combined_reach: float

class CurrentAllocation(BaseModel):
    linkedin_reach: float
    gdelt_reach: float
    combined_reach: float
    cost_per_reached_user: float

class ReachResponse(BaseModel):
    reach_points: List[ReachPoint]
    current_allocation: CurrentAllocation
