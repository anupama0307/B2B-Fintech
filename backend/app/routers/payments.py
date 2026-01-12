"""
Payments router for RISKOFF API.
Simulates loan disbursement and payment tracking.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.config import supabase_client
from app.utils.security import get_current_user, CurrentUser

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# ============ Schemas ============

class DisbursementRequest(BaseModel):
    """Request for loan disbursement."""
    bank_account_id: int = Field(..., description="Target bank account for disbursement")


class PaymentResponse(BaseModel):
    """Response for payment operations."""
    id: int
    loan_id: int
    amount: float
    status: str
    transaction_type: str
    bank_account_id: Optional[int] = None
    created_at: Optional[str] = None


# ============ Endpoints ============

@router.post("/disburse/{loan_id}")
async def disburse_loan(
    loan_id: int,
    request: DisbursementRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Simulate loan disbursement to a user's bank account.
    Only approved loans can be disbursed.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        # Fetch the loan
        loan_response = supabase_client.table("loans").select("*").eq(
            "id", loan_id
        ).eq("user_id", current_user.id).execute()
        
        if not loan_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        loan = loan_response.data[0]
        
        # Verify loan is approved
        if loan.get("status") != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Loan cannot be disbursed. Current status: {loan.get('status')}"
            )
        
        # Check if already disbursed
        if loan.get("disbursed"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Loan has already been disbursed"
            )
        
        # Verify bank account belongs to user
        account_response = supabase_client.table("bank_accounts").select("*").eq(
            "id", request.bank_account_id
        ).eq("user_id", current_user.id).execute()
        
        if not account_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        account = account_response.data[0]
        loan_amount = loan.get("amount", 0)
        
        # Update bank account balance (simulate credit)
        new_balance = account.get("balance", 0) + loan_amount
        supabase_client.table("bank_accounts").update(
            {"balance": new_balance}
        ).eq("id", request.bank_account_id).execute()
        
        # Mark loan as disbursed
        supabase_client.table("loans").update({
            "disbursed": True,
            "disbursement_date": datetime.now().isoformat(),
            "disbursement_account_id": request.bank_account_id
        }).eq("id", loan_id).execute()
        
        # Create payment record
        payment_data = {
            "user_id": current_user.id,
            "loan_id": loan_id,
            "amount": loan_amount,
            "transaction_type": "DISBURSEMENT",
            "status": "COMPLETED",
            "bank_account_id": request.bank_account_id,
            "description": f"Loan disbursement to {account.get('bank_name')} account"
        }
        
        payment_response = supabase_client.table("payments").insert(payment_data).execute()
        
        return {
            "message": "Loan disbursed successfully",
            "amount": loan_amount,
            "credited_to": {
                "bank_name": account.get("bank_name"),
                "account_number_masked": account.get("account_number_masked"),
                "new_balance": new_balance
            },
            "payment_id": payment_response.data[0].get("id") if payment_response.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/history")
async def get_payment_history(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get payment history for the authenticated user.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        response = supabase_client.table("payments").select("*").eq(
            "user_id", current_user.id
        ).order("created_at", desc=True).execute()
        
        return {
            "payments": response.data or [],
            "total": len(response.data or [])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/loan/{loan_id}")
async def get_loan_payments(
    loan_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all payments related to a specific loan.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        # Verify loan ownership
        loan_check = supabase_client.table("loans").select("user_id").eq(
            "id", loan_id
        ).execute()
        
        if not loan_check.data or loan_check.data[0].get("user_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        response = supabase_client.table("payments").select("*").eq(
            "loan_id", loan_id
        ).order("created_at", desc=True).execute()
        
        return {
            "payments": response.data or [],
            "total": len(response.data or [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
