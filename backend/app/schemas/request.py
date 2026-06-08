from pydantic import BaseModel
from typing import List, Dict, Optional

class LinkedInFilters(BaseModel):
    industries: Optional[List[str]] = None
    regions: Optional[List[str]] = None

class GDELTFilters(BaseModel):
    categories: Optional[List[str]] = None
    regions: Optional[List[str]] = None

class OverlapRequest(BaseModel):
    linkedin_filters: Optional[LinkedInFilters] = None
    gdelt_filters: Optional[GDELTFilters] = None

class ReachRequest(BaseModel):
    linkedin_filters: Optional[LinkedInFilters] = None
    gdelt_filters: Optional[GDELTFilters] = None
    budget_allocation: Dict[str, float]
