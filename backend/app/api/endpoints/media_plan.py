from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.request import ReachRequest
from app.services.reach_service import get_reach_metrics
from app.core.database import get_db
import io

router = APIRouter()

@router.post("/export")
def export_media_plan(payload: ReachRequest):
    metrics = get_reach_metrics(payload)
    current = metrics.current_allocation
    
    output = io.StringIO()
    output.write("Channel,Budget ($),Estimated Reach (Users)\n")
    output.write(f"LinkedIn,{payload.budget_allocation.get('linkedin', 0.0):.2f},{current.linkedin_reach:.0f}\n")
    output.write(f"GDELT,{payload.budget_allocation.get('gdelt', 0.0):.2f},{current.gdelt_reach:.0f}\n")
    output.write(f"Combined (Deduplicated),{sum(payload.budget_allocation.values()):.2f},{current.combined_reach:.0f}\n")
    output.write(f"Efficiency Metrics,,Cost per Reached User: ${current.cost_per_reached_user:.4f}\n")
    
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=media_plan.csv"
    return response

@router.get("/sample-data")
def download_sample_data():
    """
    Streams a sample of 100 merged profile/consumer rows from DuckDB.
    """
    output = io.StringIO()
    output.write("Audience Hash,LinkedIn Industry,LinkedIn Job Title,LinkedIn Region,GDELT Category,GDELT Media Source\n")
    
    sql = """
    SELECT 
        COALESCE(l.audience_hash, g.audience_hash) as ash,
        COALESCE(l.industry, 'N/A') as ind,
        COALESCE(l.job_title, 'N/A') as job,
        COALESCE(l.region, g.region) as reg,
        COALESCE(g.interest_category, 'N/A') as cat,
        COALESCE(g.media_source, 'N/A') as med
    FROM linkedin_profiles l
    FULL OUTER JOIN gdelt_consumers g ON l.audience_hash = g.audience_hash
    LIMIT 100
    """
    
    with get_db() as conn:
        rows = conn.execute(sql).fetchall()
        
    for r in rows:
        output.write(f"{r[0]},{r[1]},{r[2]},{r[3]},{r[4]},{r[5]}\n")
        
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=audience_sample.csv"
    return response
