from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database.schemas import GrievanceCreate, GrievanceResponse
from app.models. user import User
from app.models.grievance import Grievance
from app.models.loan import LoanApplication
from app. utils.security import get_current_user

router = APIRouter(prefix="/grievances", tags=["Grievances"])

@router.post("/submit")
def submit_grievance(data: GrievanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.loan_id:
        loan = db.query(LoanApplication).filter(
            LoanApplication. id == data.loan_id,
            LoanApplication.user_id == current_user.id
        ).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
    
    grievance = Grievance(
        user_id=current_user.id,
        loan_id=data. loan_id,
        subject=data. subject,
        description=data.description,
        grievance_type=data.grievance_type,
        status="open",
        priority="normal"
    )
    
    db.add(grievance)
    db.commit()
    db.refresh(grievance)
    
    return {"message": "Grievance submitted", "id": grievance.id}

@router. get("/my-grievances")
def get_my_grievances(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    grievances = db.query(Grievance).filter(
        Grievance. user_id == current_user.id
    ).order_by(Grievance. created_at.desc()).all()
    
    return [
        {
            "id": g.id,
            "loan_id": g. loan_id,
            "subject": g.subject,
            "description": g. description,
            "grievance_type":  g.grievance_type,
            "status": g.status,
            "admin_response": g. admin_response,
            "created_at": g. created_at.isoformat() if g.created_at else None,
            "resolved_at": g.resolved_at.isoformat() if g.resolved_at else None
        }
        for g in grievances
    ]

@router.post("/request-explanation/{loan_id}")
def request_explanation(loan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loan = db.query(LoanApplication).filter(
        LoanApplication.id == loan_id,
        LoanApplication.user_id == current_user.id
    ).first()
    
    if not loan: 
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan.status != "rejected":
        raise HTTPException(status_code=400, detail="Loan is not rejected")
    
    # Check if already requested
    existing = db.query(Grievance).filter(
        Grievance.loan_id == loan_id,
        Grievance.grievance_type == "rejection_query"
    ).first()
    
    if existing:
        return {
            "message":  "Explanation already requested",
            "grievance_id": existing.id,
            "status": existing.status,
            "response": existing.admin_response or existing.ai_suggested_response or loan.ai_rejection_reason
        }
    
    grievance = Grievance(
        user_id=current_user.id,
        loan_id=loan_id,
        subject="Request for Rejection Explanation - Loan #" + str(loan_id),
        description="I would like to understand why my loan application was rejected.",
        grievance_type="rejection_query",
        status="open",
        priority="high"
    )
    
    db. add(grievance)
    db.commit()
    
    # Return immediate AI response if available
    response = loan.ai_rejection_reason or "Your request has been submitted. Admin will respond shortly."
    
    return {
        "message": "Explanation request submitted",
        "grievance_id": grievance.id,
        "immediate_response": response
    }