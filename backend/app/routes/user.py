from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app. database.schemas import UserProfile, UserDashboard
from app.models. user import User
from app.models.loan import LoanApplication
from app.models.transaction import Transaction
from app.utils.security import get_current_user
from app.services. score_service import calculate_customer_score

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user. id,
        "email": current_user.email,
        "full_name":  current_user.full_name,
        "phone": current_user.phone,
        "date_of_birth": current_user.date_of_birth,
        "gender": current_user.gender,
        "address": current_user.address,
        "city":  current_user.city,
        "state": current_user. state,
        "pincode": current_user.pincode,
        "occupation":  current_user.occupation,
        "employer_name": current_user.employer_name,
        "employment_years": current_user.employment_years,
        "annual_income": current_user.annual_income,
        "monthly_expenses": current_user.monthly_expenses,
        "account_balance": current_user.account_balance,
        "mutual_funds": current_user.mutual_funds,
        "stocks": current_user. stocks,
        "fixed_deposits": current_user.fixed_deposits,
        "existing_loans": current_user.existing_loans,
        "existing_loan_amount": current_user. existing_loan_amount,
        "customer_score": current_user.customer_score,
        "expense_mismatch": current_user.expense_mismatch,
        "expense_mismatch_percent": current_user. expense_mismatch_percent
    }

@router.put("/profile")
def update_profile(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    allowed = ["full_name", "phone", "address", "city", "state", "pincode",
               "occupation", "employer_name", "employment_years", "annual_income",
               "monthly_expenses", "account_balance", "mutual_funds", "stocks",
               "fixed_deposits", "existing_loans", "existing_loan_amount"]
    
    for field, value in data.items():
        if field in allowed:
            setattr(current_user, field, value)
    
    # Recalculate customer score
    score_result = calculate_customer_score({
        "annual_income": current_user.annual_income,
        "monthly_expenses": current_user.monthly_expenses,
        "statement_expenses": current_user. statement_expenses,
        "existing_loan_amount": current_user.existing_loan_amount,
        "employment_years": current_user.employment_years,
        "account_balance": current_user.account_balance,
        "mutual_funds": current_user.mutual_funds,
        "stocks": current_user. stocks,
        "fixed_deposits": current_user.fixed_deposits,
        "other_investments": current_user. other_investments
    })
    current_user.customer_score = score_result["score"]
    current_user.expense_mismatch = score_result. get("expense_mismatch", False)
    current_user.expense_mismatch_percent = score_result.get("mismatch_percent", 0)
    
    db.commit()
    
    return {"message": "Profile updated", "customer_score": current_user.customer_score}

@router. get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get loan summary
    loans = db.query(LoanApplication).filter(LoanApplication. user_id == current_user.id).all()
    
    total_loans = len(loans)
    active_loans = len([l for l in loans if l.status == "approved"])
    pending_loans = len([l for l in loans if l.status == "pending"])
    rejected_loans = len([l for l in loans if l.status == "rejected"])
    
    # Get spending breakdown from transactions
    transactions = db.query(Transaction).filter(Transaction. user_id == current_user.id).all()
    
    category_totals = {}
    for t in transactions:
        if t.transaction_type == "debit" and t.category:
            category_totals[t.category] = category_totals.get(t.category, 0) + t.amount
    
    spending_breakdown = [
        {"category": cat, "amount": amt}
        for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]
    
    # Calculate totals
    monthly_income = current_user.annual_income / 12 if current_user. annual_income else 0
    total_assets = (
        (current_user.account_balance or 0) +
        (current_user.mutual_funds or 0) +
        (current_user.stocks or 0) +
        (current_user. fixed_deposits or 0) +
        (current_user. other_investments or 0)
    )
    
    # Income vs expense trend (mock data for now)
    income_vs_expense = [
        {"month": "Aug", "income": monthly_income * 0.95, "expenses": (current_user.monthly_expenses or 0) * 0.9},
        {"month": "Sep", "income": monthly_income * 0.98, "expenses": (current_user.monthly_expenses or 0) * 1.1},
        {"month": "Oct", "income": monthly_income, "expenses": (current_user.monthly_expenses or 0) * 0.95},
        {"month": "Nov", "income": monthly_income * 1.02, "expenses": (current_user.monthly_expenses or 0)},
        {"month": "Dec", "income": monthly_income * 1.1, "expenses": (current_user.monthly_expenses or 0) * 1.2},
        {"month": "Jan", "income": monthly_income, "expenses": current_user.monthly_expenses or 0}
    ]
    
    return {
        "customer_score": current_user.customer_score or 0,
        "customer_score_grade": get_score_grade(current_user.customer_score or 0),
        "total_assets": total_assets,
        "monthly_income": monthly_income,
        "monthly_expenses": current_user.monthly_expenses or 0,
        "statement_expenses": current_user.statement_expenses or 0,
        "expense_mismatch": current_user.expense_mismatch,
        "expense_mismatch_percent": current_user. expense_mismatch_percent or 0,
        "account_balance": current_user.account_balance or 0,
        "investments": {
            "mutual_funds": current_user.mutual_funds or 0,
            "stocks": current_user.stocks or 0,
            "fixed_deposits":  current_user.fixed_deposits or 0,
            "other":  current_user.other_investments or 0
        },
        "spending_breakdown":  spending_breakdown if spending_breakdown else [
            {"category": "food", "amount": (current_user.monthly_expenses or 0) * 0.3},
            {"category": "shopping", "amount": (current_user.monthly_expenses or 0) * 0.2},
            {"category": "bills", "amount": (current_user.monthly_expenses or 0) * 0.25},
            {"category": "transport", "amount": (current_user.monthly_expenses or 0) * 0.15},
            {"category": "other", "amount": (current_user.monthly_expenses or 0) * 0.1}
        ],
        "income_vs_expense": income_vs_expense,
        "loan_summary": {
            "total":  total_loans,
            "active": active_loans,
            "pending": pending_loans,
            "rejected": rejected_loans
        }
    }

def get_score_grade(score:  int) -> str:
    if score >= 750:
        return "Excellent"
    elif score >= 650:
        return "Good"
    elif score >= 550:
        return "Fair"
    elif score >= 400:
        return "Poor"
    else: 
        return "Very Poor"

@router.get("/customer-score")
def get_customer_score(current_user: User = Depends(get_current_user)):
    score_result = calculate_customer_score({
        "annual_income": current_user.annual_income,
        "monthly_expenses": current_user.monthly_expenses,
        "statement_expenses": current_user.statement_expenses,
        "existing_loan_amount":  current_user.existing_loan_amount,
        "employment_years": current_user.employment_years,
        "account_balance": current_user.account_balance,
        "mutual_funds": current_user.mutual_funds,
        "stocks":  current_user.stocks,
        "fixed_deposits": current_user.fixed_deposits,
        "other_investments": current_user.other_investments or 0
    })
    
    return score_result