from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database. database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.utils.security import get_current_user
from app.services.statement_parser import parse_bank_statement
from app.services. score_service import calculate_customer_score

router = APIRouter(prefix="/statement", tags=["Bank Statement"])

@router.post("/upload")
async def upload_statement(
    file: UploadFile = File(... ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename. endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    content_str = content. decode('utf-8')
    
    result = parse_bank_statement(content_str)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail="Failed to parse statement:  " + result. get("error", "Unknown error"))
    
    # Save transactions
    for t in result. get("transactions", []):
        transaction = Transaction(
            user_id=current_user.id,
            description=t["description"],
            amount=t["debit"] if t["debit"] > 0 else t["credit"],
            transaction_type="debit" if t["debit"] > 0 else "credit",
            category=t["category"]
        )
        db.add(transaction)
    
    # Update user's statement expenses
    current_user.statement_expenses = result["monthly_expenses"]
    
    # Check for expense mismatch
    if current_user.monthly_expenses and current_user.monthly_expenses > 0:
        diff = abs(result["monthly_expenses"] - current_user. monthly_expenses)
        diff_percent = (diff / current_user. monthly_expenses) * 100
        
        current_user.expense_mismatch = diff_percent > 25
        current_user.expense_mismatch_percent = round(diff_percent, 1)
    
    # Recalculate customer score
    score_result = calculate_customer_score({
        "annual_income": current_user.annual_income,
        "monthly_expenses": current_user.monthly_expenses,
        "statement_expenses": result["monthly_expenses"],
        "existing_loan_amount": current_user.existing_loan_amount,
        "employment_years": current_user.employment_years,
        "account_balance": current_user. account_balance,
        "mutual_funds":  current_user.mutual_funds,
        "stocks": current_user. stocks,
        "fixed_deposits": current_user. fixed_deposits,
        "other_investments": current_user. other_investments or 0
    })
    
    current_user.customer_score = score_result["score"]
    
    db.commit()
    
    return {
        "message": "Statement uploaded and processed",
        "monthly_expenses_from_statement": result["monthly_expenses"],
        "stated_monthly_expenses": current_user.monthly_expenses,
        "expense_mismatch":  current_user.expense_mismatch,
        "mismatch_percent":  current_user.expense_mismatch_percent,
        "new_customer_score": current_user.customer_score,
        "spending_breakdown": result["spending_breakdown"],
        "total_transactions": result["total_transactions"]
    }

@router.get("/spending-breakdown")
def get_spending_breakdown(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "debit"
    ).all()
    
    category_totals = {}
    for t in transactions: 
        if t.category: 
            category_totals[t.category] = category_totals.get(t.category, 0) + t.amount
    
    total = sum(category_totals.values())
    
    breakdown = [
        {
            "category": cat,
            "amount":  amt,
            "percentage": round((amt / total) * 100, 1) if total > 0 else 0
        }
        for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return {
        "total_expenses": total,
        "breakdown": breakdown
    }