from typing import Optional, List
from app.core.database import get_db
from app.schemas.request import OverlapRequest
from app.schemas.response import OverlapResponse

def build_linkedin_query(industries: Optional[List[str]], regions: Optional[List[str]]) -> tuple[str, list]:
    query = "SELECT DISTINCT audience_hash FROM linkedin_profiles WHERE 1=1"
    params = []
    
    if industries:
        placeholders = ", ".join(["?"] * len(industries))
        query += f" AND industry IN ({placeholders})"
        params.extend(industries)
        
    if regions:
        placeholders = ", ".join(["?"] * len(regions))
        query += f" AND region IN ({placeholders})"
        params.extend(regions)
        
    return query, params

def build_gdelt_query(categories: Optional[List[str]], regions: Optional[List[str]]) -> tuple[str, list]:
    query = "SELECT DISTINCT audience_hash FROM gdelt_consumers WHERE 1=1"
    params = []
    
    if categories:
        placeholders = ", ".join(["?"] * len(categories))
        query += f" AND interest_category IN ({placeholders})"
        params.extend(categories)
        
    if regions:
        placeholders = ", ".join(["?"] * len(regions))
        query += f" AND region IN ({placeholders})"
        params.extend(regions)
        
    return query, params

def get_overlap_metrics(payload: OverlapRequest) -> OverlapResponse:
    li_filters = payload.linkedin_filters
    gd_filters = payload.gdelt_filters
    
    li_industries = li_filters.industries if li_filters else None
    li_regions = li_filters.regions if li_filters else None
    
    gd_categories = gd_filters.categories if gd_filters else None
    gd_regions = gd_filters.regions if gd_filters else None
    
    li_subquery, li_params = build_linkedin_query(li_industries, li_regions)
    gd_subquery, gd_params = build_gdelt_query(gd_categories, gd_regions)
    
    # Combined parameters: first for li subquery, then gd subquery, then intersect (li + gd)
    # Because the CTEs will only be evaluated once, but duckdb might require parameters mapped in order.
    # To be extremely safe with DuckDB parameter binding, we can embed the literals or use named parameters.
    # Or, we can use positional parameters. Let's see:
    # "WITH li AS ( {li_subquery} ), gd AS ( {gd_subquery} ) ..."
    # The parameters are bound in order of appearance in the SQL.
    # In:
    # WITH li AS ( ... ? ... ), gd AS ( ... ? ... )
    # SELECT (SELECT count(*) FROM li), (SELECT count(*) FROM gd), (SELECT count(*) FROM (SELECT * FROM li INTERSECT SELECT * FROM gd))
    # The parameters appear exactly in:
    # 1. li subquery (li_params)
    # 2. gd subquery (gd_params)
    # Total parameters is li_params + gd_params.
    
    sql = f"""
    WITH li AS (
        {li_subquery}
    ),
    gd AS (
        {gd_subquery}
    )
    SELECT
        (SELECT COUNT(*) FROM li) AS li_count,
        (SELECT COUNT(*) FROM gd) AS gd_count,
        (SELECT COUNT(*) FROM (SELECT audience_hash FROM li INTERSECT SELECT audience_hash FROM gd)) AS intersect_count
    """
    
    all_params = li_params + gd_params
    
    with get_db() as conn:
        res = conn.execute(sql, all_params).fetchone()
        
    linkedin_total = res[0]
    gdelt_total = res[1]
    overlap_total = res[2]
    
    union_total = linkedin_total + gdelt_total - overlap_total
    
    jaccard_similarity = 0.0
    if union_total > 0:
        jaccard_similarity = float(overlap_total) / float(union_total)
        
    return OverlapResponse(
        linkedin_total=linkedin_total,
        gdelt_total=gdelt_total,
        overlap_total=overlap_total,
        union_total=union_total,
        jaccard_similarity=round(jaccard_similarity, 4)
    )
