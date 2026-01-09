"""
Analytics Router
Provides spending breakdown and AI-powered financial advice.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.config import supabase_client
from app.utils.security import get_current_user, CurrentUser
from app.services import llm

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/spending")
async def get_spending_analytics(current_user: CurrentUser = Depends(get_current_user)):
    """
    Get spending breakdown by category and AI financial advice.
    """
    try:
        # 1. Fetch transactions for the current user
        response = supabase_client.table("transactions").select("*").eq("user_id", current_user.id).execute()
        txns = response.data or []
        
        if not txns:
            return {
                "total_spent": 0,
                "breakdown": {},
                "ai_advisor_feedback": "No transaction data available. Upload a bank statement to get insights!"
            }

        # 2. Aggregate Data
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            # Check for 'Debit' or negative amounts if type not specified
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        # 3. Get AI Advice
        summary = f"Total Spent: ${round(total_spent, 2)}. Breakdown: {category_totals}"
        advice = await llm.generate_financial_advice(summary)

        return {
            "total_spent": round(total_spent, 2),
            "breakdown": category_totals,
            "ai_advisor_feedback": advice
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")
