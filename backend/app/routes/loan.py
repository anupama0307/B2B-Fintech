from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import get_db
from app.database.schemas import LoanCreate
from app.models.user import User
from app.models.loan import LoanApplication
from app.models.predictor import RiskPredictor
from app.utils.security import get_current_user
from app.services.ai_response import generate_rejection_explanation

router = APIRouter(prefix="/loans", tags=["Loans"])

risk_predictor = RiskPredictor()
risk_predictor.train_model()


@router.post("/apply")
def apply_loan(
    data: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    risk_data = {
        "age": 30,
        "annual_income": current_user.annual_income or 0,
        "employment_years": current_user.employment_years or 0,
        "existing_loan_amount": current_user.existing_loan_amount or 0,
        "monthly_expenses": current_user.monthly_expenses or 0,
        "loan_amount_requested": data.loan_amount,
        "loan_tenure_months": data.loan_tenure_months,
        "customer_score": current_user.customer_score or 500,
        "has_expense_mismatch": current_user.expense_mismatch or False,
    }

    risk_result = risk_predictor.predict(risk_data)

    decision = risk_result["decision"]
    auto_decision = decision in ("AUTO_APPROVE", "AUTO_REJECT")

    if decision == "AUTO_APPROVE":
        status = "approved"
    elif decision == "AUTO_REJECT":
        status = "rejected"
    else:
        status = "pending"

    ai_reason = None
    if status == "rejected":
        ai_reason = generate_rejection_explanation(
            {
                "risk_score": risk_result["risk_score"],
                "risk_category": risk_result["risk_category"],
                "loan_amount": data.loan_amount,
                "monthly_emi": risk_result["monthly_emi"],
            },
            {
                "annual_income": current_user.annual_income,
                "monthly_expenses": current_user.monthly_expenses,
                "existing_loan_amount": current_user.existing_loan_amount,
                "customer_score": current_user.customer_score,
                "employment_years": current_user.employment_years,
                "expense_mismatch": current_user.expense_mismatch,
            },
        )

    loan = LoanApplication(
        user_id=current_user.id,
        loan_type=data.loan_type,
        loan_provider=data.loan_provider or "RISKON Bank",
        loan_amount=data.loan_amount,
        loan_tenure_months=data.loan_tenure_months,
        loan_purpose=data.loan_purpose,
        risk_score=risk_result["risk_score"],
        risk_category=risk_result["risk_category"],
        monthly_emi=risk_result["monthly_emi"],
        emi_to_income_ratio=risk_result["emi_to_income_ratio"],
        max_recommended_loan=risk_result["max_recommended_loan"],
        customer_score_at_application=current_user.customer_score or 0,
        status=status,
        auto_decision=auto_decision,
        ai_rejection_reason=ai_reason,
        approved_amount=data.loan_amount if status == "approved" else None,
        interest_rate=10.0 if status == "approved" else None,
        reviewed_at=datetime.utcnow() if auto_decision else None,
    )

    db.add(loan)
    db.commit()
    db.refresh(loan)

    return {
        "message": "Loan application submitted",
        "loan_id": loan.id,
        "status": status,
        "auto_decision": auto_decision,
        "risk_score": risk_result["risk_percentage"],
        "risk_category": risk_result["risk_category"],
        "monthly_emi": risk_result["monthly_emi"],
        "recommendation": risk_result["recommendation"],
    }


@router.get("/my-loans")
def get_my_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loans = (
        db.query(LoanApplication)
        .filter(LoanApplication.user_id == current_user.id)
        .order_by(LoanApplication.applied_at.desc())
        .all()
    )

    return [
        {
            "id": l.id,
            "loan_type": l.loan_type,
            "loan_provider": l.loan_provider,
            "loan_amount": l.loan_amount,
            "loan_tenure_months": l.loan_tenure_months,
            "monthly_emi": l.monthly_emi,
            "risk_score": l.risk_score,
            "risk_category": l.risk_category,
            "status": l.status,
            "auto_decision": l.auto_decision,
            "rejection_reason": l.ai_rejection_reason,
            "approved_amount": l.approved_amount,
            "interest_rate": l.interest_rate,
            "applied_at": l.applied_at.isoformat() if l.applied_at else None,
            "reviewed_at": l.reviewed_at.isoformat() if l.reviewed_at else None,
        }
        for l in loans
    ]


@router.get("/{loan_id}")
def get_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.id == loan_id,
            LoanApplication.user_id == current_user.id,
        )
        .first()
    )

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    return {
        "id": loan.id,
        "loan_type": loan.loan_type,
        "loan_provider": loan.loan_provider,
        "loan_amount": loan.loan_amount,
        "loan_tenure_months": loan.loan_tenure_months,
        "loan_purpose": loan.loan_purpose,
        "monthly_emi": loan.monthly_emi,
        "risk_score": loan.risk_score,
        "risk_category": loan.risk_category,
        "emi_to_income_ratio": loan.emi_to_income_ratio,
        "status": loan.status,
        "auto_decision": loan.auto_decision,
        "admin_remarks": loan.admin_remarks,
        "rejection_reason": loan.ai_rejection_reason,
        "approved_amount": loan.approved_amount,
        "interest_rate": loan.interest_rate,
        "applied_at": loan.applied_at.isoformat() if loan.applied_at else None,
        "reviewed_at": loan.reviewed_at.isoformat() if loan.reviewed_at else None,
    }


@router.get("/types/list")
def get_loan_types():
    return {
        "loan_types": [
            {"id": "personal", "name": "Personal Loan", "min": 10000, "max": 1000000, "rate": "10.5% - 18%"},
            {"id": "home", "name": "Home Loan", "min": 500000, "max": 50000000, "rate": "8.5% - 12%"},
            {"id": "car", "name": "Car Loan", "min": 100000, "max": 5000000, "rate": "9% - 15%"},
            {"id": "education", "name": "Education Loan", "min": 50000, "max": 10000000, "rate": "8% - 14%"},
            {"id": "business", "name": "Business Loan", "min": 100000, "max": 20000000, "rate": "12% - 20%"},
        ]
    }
