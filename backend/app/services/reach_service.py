import math
from typing import Dict
from app.core.database import get_db
from app.schemas.request import ReachRequest, OverlapRequest
from app.schemas.response import ReachResponse, ReachPoint, CurrentAllocation
from app.services.overlap_service import get_overlap_metrics

def get_reach_parameters() -> Dict[str, Dict[str, float]]:
    """
    Fetch alpha and beta constants from the reach_model_parameters table.
    """
    params = {}
    with get_db() as conn:
        rows = conn.execute("SELECT channel, alpha, beta FROM reach_model_parameters").fetchall()
    for row in rows:
        params[row[0]] = {"alpha": row[1], "beta": row[2]}
    
    # Fallback to default constants if database is empty
    if "linkedin" not in params:
        params["linkedin"] = {"alpha": 0.82, "beta": 0.00012}
    if "gdelt" not in params:
        params["gdelt"] = {"alpha": 0.88, "beta": 0.00008}
        
    return params

def calculate_single_reach(cohort_size: int, budget: float, alpha: float, beta: float) -> float:
    """
    Standard exponential saturation formula: Reach = Size * alpha * (1 - e^(-beta * budget))
    """
    if cohort_size <= 0 or budget <= 0:
        return 0.0
    reach_fraction = alpha * (1.0 - math.exp(-beta * budget))
    return cohort_size * reach_fraction

def get_reach_metrics(payload: ReachRequest) -> ReachResponse:
    # 1. Fetch current cohort sizes and overlap dynamically using the overlap service
    overlap_req = OverlapRequest(
        linkedin_filters=payload.linkedin_filters,
        gdelt_filters=payload.gdelt_filters
    )
    overlap_metrics = get_overlap_metrics(overlap_req)
    
    li_size = overlap_metrics.linkedin_total
    gd_size = overlap_metrics.gdelt_total
    overlap_size = overlap_metrics.overlap_total
    
    # 2. Get saturation curve constants
    params = get_reach_parameters()
    li_alpha, li_beta = params["linkedin"]["alpha"], params["linkedin"]["beta"]
    gd_alpha, gd_beta = params["gdelt"]["alpha"], params["gdelt"]["beta"]
    
    # 3. Compute reach for current allocations
    li_budget = payload.budget_allocation.get("linkedin", 0.0)
    gd_budget = payload.budget_allocation.get("gdelt", 0.0)
    total_budget = li_budget + gd_budget
    
    # Probabilities of exposure
    p_li = li_alpha * (1.0 - math.exp(-li_beta * li_budget)) if li_budget > 0 else 0.0
    p_gd = gd_alpha * (1.0 - math.exp(-gd_beta * gd_budget)) if gd_budget > 0 else 0.0
    
    # Combined probability of exposure for overlap members
    p_combined = p_li + p_gd - (p_li * p_gd)
    
    # Expected reach per segment
    li_only_reach = (li_size - overlap_size) * p_li
    gd_only_reach = (gd_size - overlap_size) * p_gd
    overlap_reach = overlap_size * p_combined
    
    current_li_reach = li_size * p_li
    current_gd_reach = gd_size * p_gd
    current_combined_reach = li_only_reach + gd_only_reach + overlap_reach
    
    cost_per_user = 0.0
    if current_combined_reach > 0:
        cost_per_user = total_budget / current_combined_reach
        
    current_allocation = CurrentAllocation(
        linkedin_reach=round(current_li_reach, 2),
        gdelt_reach=round(current_gd_reach, 2),
        combined_reach=round(current_combined_reach, 2),
        cost_per_reached_user=round(cost_per_user, 4)
    )
    
    # 4. Generate points for the curve
    # We will split budget according to current ratios, or 50/50 if total budget is 0
    if total_budget > 0:
        li_ratio = li_budget / total_budget
        gd_ratio = gd_budget / total_budget
    else:
        li_ratio = 0.5
        gd_ratio = 0.5
        
    # We will generate 11 points from $0 up to $50,000 in increments of $5,000
    reach_points = []
    for step in range(11):
        step_budget = float(step * 5000)
        step_li_budget = step_budget * li_ratio
        step_gd_budget = step_budget * gd_ratio
        
        step_p_li = li_alpha * (1.0 - math.exp(-li_beta * step_li_budget)) if step_li_budget > 0 else 0.0
        step_p_gd = gd_alpha * (1.0 - math.exp(-gd_beta * step_gd_budget)) if step_gd_budget > 0 else 0.0
        step_p_combined = step_p_li + step_p_gd - (step_p_li * step_p_gd)
        
        step_li_reach = li_size * step_p_li
        step_gd_reach = gd_size * step_p_gd
        step_combined = (li_size - overlap_size) * step_p_li + (gd_size - overlap_size) * step_p_gd + overlap_size * step_p_combined
        
        reach_points.append(ReachPoint(
            budget=step_budget,
            linkedin_reach=round(step_li_reach, 2),
            gdelt_reach=round(step_gd_reach, 2),
            combined_reach=round(step_combined, 2)
        ))
        
    return ReachResponse(
        reach_points=reach_points,
        current_allocation=current_allocation
    )
