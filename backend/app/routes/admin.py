from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List

from app.database. database import get_db
from app.database.schemas import AdminStats, LoanStatusUpdate, RiskAnalysisRequest, RiskAnalysisResponse, GrievanceReply
from app.models.user import User
from app.models. loan import LoanApplication
from app.models. grievance import Grievance
from app.models.predictor import RiskPredictor
from app.utils.security import get_current_admin
from app.services. ai_response import generate_rejection_explanation, generate_grievance_response

router = APIRouter(prefix="/admin", tags=["Admin"])

risk_predictor = RiskPredictor()
if not risk_predictor.is_ready():
    risk_predictor.train_model()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    total = db.query(LoanApplication).count()
    pending = db.query(LoanApplication).filter(LoanApplication.status == "pending").count()
    approved = db.query(LoanApplication).filter(LoanApplication.status == "approved").count()
    rejected = db.query(LoanApplication).filter(LoanApplication.status == "rejected").count()
    
    auto_approved = db.query(LoanApplication).filter(
        LoanApplication. status == "approved",
        LoanApplication.auto_decision == True
    ).count()
    
    auto_rejected = db. query(LoanApplication).filter(
        LoanApplication.status == "rejected",
        LoanApplication. auto_decision == True
    ).count()
    
    total_disbursed = db. query(func.sum(LoanApplication.approved_amount)).filter(
        LoanApplication.status == "approved"
    ).scalar() or 0
    
    open_grievances = db.query(Grievance).filter(Grievance.status == "open").count()
    
    # Fraud alerts - users with expense mismatch
    fraud_alerts = db.query(User).filter(User.expense_mismatch == True).count()
    
    return {
        "total_applications": total,
        "pending_applications":  pending,
        "approved_applications": approved,
        "rejected_applications": rejected,
        "auto_approved":  auto_approved,
        "auto_rejected": auto_rejected,
        "manual_review_pending": pending,
        "total_disbursed":  total_disbursed,
        "open_grievances": open_grievances,
        "fraud_alerts": fraud_alerts
    }

@router.get("/loans")
def get_all_loans(status: str = None, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    query = db. query(LoanApplication)
    
    if status:
        query = query.filter(LoanApplication. status == status)
    
    loans = query.order_by(LoanApplication.applied_at.desc()).all()
    
    result = []
    for loan in loans: 
        user = db.query(User).filter(User.id == loan.user_id).first()
        result.append({
            "id": loan. id,
            "user_name": user.full_name if user else "Unknown",
            "user_email": user. email if user else "",
            "customer_score": loan.customer_score_at_application,
            "loan_type": loan.loan_type,
            "loan_provider": loan.loan_provider,
            "loan_amount": loan.loan_amount,
            "loan_tenure_months": loan.loan_tenure_months,
            "monthly_emi": loan. monthly_emi,
            "risk_score": loan.risk_score,
            "risk_category":  loan.risk_category,
            "emi_to_income_ratio": loan. emi_to_income_ratio,
            "status": loan.status,
            "auto_decision":  loan.auto_decision,
            "applied_at": loan. applied_at.isoformat() if loan.applied_at else None
        })
    
    return result

@router.get("/loans/{loan_id}")
def get_loan_detail(loan_id:  int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    user = db. query(User).filter(User.id == loan.user_id).first()
    
    return {
        "loan":  {
            "id": loan.id,
            "loan_type": loan.loan_type,
            "loan_provider":  loan.loan_provider,
            "loan_amount": loan. loan_amount,
            "loan_tenure_months": loan. loan_tenure_months,
            "loan_purpose": loan. loan_purpose,
            "monthly_emi": loan.monthly_emi,
            "risk_score": loan.risk_score,
            "risk_category": loan.risk_category,
            "emi_to_income_ratio": loan. emi_to_income_ratio,
            "max_recommended_loan":  loan.max_recommended_loan,
            "status": loan.status,
            "auto_decision": loan.auto_decision,
            "admin_remarks": loan. admin_remarks,
            "rejection_reason": loan. rejection_reason,
            "ai_rejection_reason":  loan.ai_rejection_reason,
            "approved_amount": loan. approved_amount,
            "interest_rate": loan.interest_rate,
            "applied_at": loan.applied_at. isoformat() if loan.applied_at else None,
            "reviewed_at":  loan.reviewed_at.isoformat() if loan.reviewed_at else None
        },
        "user": {
            "id": user.id if user else None,
            "full_name": user.full_name if user else "",
            "email":  user.email if user else "",
            "phone": user.phone if user else "",
            "occupation": user.occupation if user else "",
            "annual_income": user. annual_income if user else 0,
            "monthly_expenses": user. monthly_expenses if user else 0,
            "employment_years": user. employment_years if user else 0,
            "existing_loans": user.existing_loans if user else 0,
            "existing_loan_amount": user.existing_loan_amount if user else 0,
            "customer_score": user.customer_score if user else 0,
            "expense_mismatch":  user.expense_mismatch if user else False,
            "expense_mismatch_percent": user.expense_mismatch_percent if user else 0
        }
    }

@router.put("/loans/{loan_id}/status")
def update_loan_status(loan_id: int, data: LoanStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    user = db.query(User).filter(User.id == loan. user_id).first()
    
    loan.status = data. status
    loan. admin_id = admin.id
    loan.admin_remarks = data. admin_remarks
    loan.reviewed_at = datetime.utcnow()
    loan.auto_decision = False
    
    if data.status == "rejected":
        loan. rejection_reason = data.rejection_reason
        # Generate AI reason if not provided
        if not data.rejection_reason and user:
            loan. ai_rejection_reason = generate_rejection_explanation(
                {"risk_score": loan.risk_score, "risk_category":  loan.risk_category,
                 "loan_amount": loan.loan_amount, "monthly_emi": loan.monthly_emi},
                {"annual_income":  user.annual_income, "monthly_expenses": user.monthly_expenses,
                 "existing_loan_amount": user.existing_loan_amount, "customer_score":  user.customer_score,
                 "employment_years": user.employment_years, "expense_mismatch": user.expense_mismatch}
            )
    elif data.status == "approved":
        loan.approved_amount = data. approved_amount or loan.loan_amount
        loan.interest_rate = data. interest_rate or 10.0
    
    db.commit()
    
    return {"message":  "Loan status updated", "status": data.status}

@router.post("/risk-analysis", response_model=RiskAnalysisResponse)
def analyze_risk(data: RiskAnalysisRequest, admin: User = Depends(get_current_admin)):
    result = risk_predictor.predict(data. dict())
    return result

@router.get("/grievances")
def get_grievances(status: str = None, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    query = db.query(Grievance)
    
    if status: 
        query = query.filter(Grievance.status == status)
    
    grievances = query. order_by(Grievance.created_at.desc()).all()
    
    result = []
    for g in grievances: 
        user = db. query(User).filter(User.id == g.user_id).first()
        result.append({
            "id": g.id,
            "user_name":  user.full_name if user else "Unknown",
            "user_email": user. email if user else "",
            "loan_id": g. loan_id,
            "subject": g.subject,
            "description": g.description,
            "grievance_type": g.grievance_type,
            "status": g.status,
            "priority": g.priority,
            "admin_response": g.admin_response,
            "ai_suggested_response": g.ai_suggested_response,
            "created_at": g.created_at.isoformat() if g.created_at else None
        })
    
    return result

@router.get("/grievances/{grievance_id}")
def get_grievance_detail(grievance_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance: 
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    user = db.query(User).filter(User.id == grievance.user_id).first()
    loan = None
    if grievance.loan_id:
        loan = db.query(LoanApplication).filter(LoanApplication. id == grievance. loan_id).first()
    
    # Generate AI suggestion if not exists
    if not grievance.ai_suggested_response:
        if grievance.grievance_type == "rejection_query" and loan:
            grievance.ai_suggested_response = generate_rejection_explanation(
                {"risk_score":  loan.risk_score, "risk_category": loan.risk_category,
                 "loan_amount":  loan.loan_amount, "monthly_emi": loan.monthly_emi},
                {"annual_income": user.annual_income if user else 0,
                 "monthly_expenses": user. monthly_expenses if user else 0,
                 "existing_loan_amount": user.existing_loan_amount if user else 0,
                 "customer_score":  user.customer_score if user else 0,
                 "employment_years": user.employment_years if user else 0,
                 "expense_mismatch":  user.expense_mismatch if user else False}
            )
        else:
            grievance.ai_suggested_response = generate_grievance_response(
                {"grievance_type": grievance.grievance_type}
            )
        db.commit()
    
    return {
        "grievance":  {
            "id": grievance.id,
            "subject": grievance.subject,
            "description": grievance.description,
            "grievance_type": grievance.grievance_type,
            "status": grievance. status,
            "priority": grievance. priority,
            "admin_response": grievance.admin_response,
            "ai_suggested_response":  grievance.ai_suggested_response,
            "created_at": grievance.created_at.isoformat() if grievance.created_at else None
        },
        "user": {
            "full_name": user. full_name if user else "",
            "email": user.email if user else ""
        },
        "loan":  {
            "id": loan.id if loan else None,
            "loan_type": loan.loan_type if loan else None,
            "loan_amount": loan.loan_amount if loan else None,
            "status": loan.status if loan else None
        } if loan else None
    }

@router.put("/grievances/{grievance_id}/reply")
def reply_grievance(grievance_id: int, data: GrievanceReply, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance: 
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    grievance.status = data.status
    grievance.admin_id = admin.id
    grievance.admin_response = data.admin_response
    
    if data.status == "resolved": 
        grievance.resolved_at = datetime. utcnow()
    
    db.commit()
    
    return {"message": "Grievance updated", "status": data.status}

@router.get("/fraud-alerts")
def get_fraud_alerts(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    users = db.query(User).filter(User.expense_mismatch == True).all()
    
    return [
        {
            "id": u.id,
            "full_name":  u.full_name,
            "email": u.email,
            "stated_expenses": u.monthly_expenses,
            "actual_expenses": u. statement_expenses,
            "mismatch_percent":  u.expense_mismatch_percent
        }
        for u in users
    ]