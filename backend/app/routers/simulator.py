"""
Simulator router for RISKOFF API.
Provides 'What If' analysis for loan applicants without saving data.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.risk_engine import calculate_risk_score
from app.schemas import RiskResult

router = APIRouter(
    prefix="/simulator",
    tags=["Simulator"]
)

class SimulationRequest(BaseModel):
    amount: float
    tenure_months: int
    income: float
    expenses: float

@router.post("/calculate", response_model=RiskResult)
async def simulate_loan_risk(request: SimulationRequest):
    """
    Simulate a loan application risk assessment.
    Returns the calculate risk score and decision without saving to the database.
    Useful for 'What If' calculators on the frontend.
    """
    if request.amount <= 0 or request.income < 0 or request.expenses < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount, income, and expenses must be non-negative."
        )

    try:
        result = calculate_risk_score(
            amount=request.amount,
            tenure_months=request.tenure_months,
            income=request.income,
            expenses=request.expenses
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation failed: {str(e)}"
        )
