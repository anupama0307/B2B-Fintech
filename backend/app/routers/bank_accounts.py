"""
Bank Accounts router for RISKOFF API.
Allows users to manage multiple bank accounts with cumulative balance tracking.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from app.config import supabase_client
from app.utils.security import get_current_user, CurrentUser

router = APIRouter(
    prefix="/bank-accounts",
    tags=["Bank Accounts"]
)


# ============ Schemas ============

class BankAccountCreate(BaseModel):
    """Schema for creating a new bank account."""
    bank_name: str = Field(..., min_length=2, max_length=100, description="Name of the bank")
    account_number: str = Field(..., min_length=6, max_length=20, description="Account number (will be stored masked)")
    ifsc_code: str = Field(..., min_length=11, max_length=11, description="IFSC code")
    account_type: str = Field(default="savings", description="savings or current")
    balance: float = Field(default=0.0, ge=0, description="Current balance")
    is_primary: bool = Field(default=False, description="Whether this is the primary account")


class BankAccountUpdate(BaseModel):
    """Schema for updating a bank account."""
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    balance: Optional[float] = Field(None, ge=0)
    is_primary: Optional[bool] = None


class BankAccountResponse(BaseModel):
    """Response schema for bank account."""
    id: int
    bank_name: str
    account_number_masked: str
    ifsc_code: str
    account_type: str
    balance: float
    is_primary: bool
    created_at: Optional[str] = None


# ============ Helper Functions ============

def mask_account_number(account_number: str) -> str:
    """Mask account number for security, showing only last 4 digits."""
    if len(account_number) <= 4:
        return "*" * len(account_number)
    return "X" * (len(account_number) - 4) + account_number[-4:]


# ============ Endpoints ============

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_bank_account(
    account: BankAccountCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Add a new bank account for the authenticated user.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        # If this is set as primary, unset other primary accounts
        if account.is_primary:
            supabase_client.table("bank_accounts").update(
                {"is_primary": False}
            ).eq("user_id", current_user.id).execute()
        
        # Insert new account
        account_data = {
            "user_id": current_user.id,
            "bank_name": account.bank_name,
            "account_number": account.account_number,
            "account_number_masked": mask_account_number(account.account_number),
            "ifsc_code": account.ifsc_code.upper(),
            "account_type": account.account_type.lower(),
            "balance": account.balance,
            "is_primary": account.is_primary
        }
        
        response = supabase_client.table("bank_accounts").insert(account_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add bank account"
            )
        
        record = response.data[0]
        return {
            "message": "Bank account added successfully",
            "account": {
                "id": record.get("id"),
                "bank_name": record.get("bank_name"),
                "account_number_masked": record.get("account_number_masked"),
                "ifsc_code": record.get("ifsc_code"),
                "account_type": record.get("account_type"),
                "balance": record.get("balance"),
                "is_primary": record.get("is_primary")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/")
async def get_bank_accounts(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all bank accounts for the authenticated user.
    Returns individual accounts and cumulative totals.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        response = supabase_client.table("bank_accounts").select("*").eq(
            "user_id", current_user.id
        ).order("is_primary", desc=True).order("created_at", desc=True).execute()
        
        accounts = response.data or []
        
        # Calculate cumulative totals
        total_balance = sum(acc.get("balance", 0) for acc in accounts)
        savings_balance = sum(acc.get("balance", 0) for acc in accounts if acc.get("account_type") == "savings")
        current_balance = sum(acc.get("balance", 0) for acc in accounts if acc.get("account_type") == "current")
        
        # Remove raw account numbers from response
        for acc in accounts:
            acc.pop("account_number", None)
        
        return {
            "accounts": accounts,
            "total_count": len(accounts),
            "cumulative": {
                "total_balance": total_balance,
                "savings_balance": savings_balance,
                "current_balance": current_balance
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{account_id}")
async def get_bank_account(
    account_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific bank account by ID.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        response = supabase_client.table("bank_accounts").select("*").eq(
            "id", account_id
        ).eq("user_id", current_user.id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        account = response.data[0]
        account.pop("account_number", None)  # Remove raw account number
        
        return account
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/{account_id}")
async def update_bank_account(
    account_id: int,
    updates: BankAccountUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a bank account.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        # Verify ownership
        check = supabase_client.table("bank_accounts").select("id").eq(
            "id", account_id
        ).eq("user_id", current_user.id).execute()
        
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        # If setting as primary, unset others
        if updates.is_primary:
            supabase_client.table("bank_accounts").update(
                {"is_primary": False}
            ).eq("user_id", current_user.id).execute()
        
        # Build update payload
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        
        if update_data:
            supabase_client.table("bank_accounts").update(update_data).eq("id", account_id).execute()
        
        return {"message": "Bank account updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{account_id}")
async def delete_bank_account(
    account_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Delete a bank account.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )

    try:
        # Verify ownership
        check = supabase_client.table("bank_accounts").select("id").eq(
            "id", account_id
        ).eq("user_id", current_user.id).execute()
        
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        supabase_client.table("bank_accounts").delete().eq("id", account_id).execute()
        
        return {"message": "Bank account deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
