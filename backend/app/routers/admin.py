"""
Admin router for RISKOFF API.
Handles administrative operations on loans.
"""

from fastapi import APIRouter, HTTPException, status, Query
from app.config import supabase_client
from app.schemas import LoanStatusUpdate
from app.services.notification import notification_service
from typing import Optional

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/loans")
async def get_all_loans(status: Optional[str] = Query(None, description="Filter by loan status (e.g., PENDING)")):
    """
    Get all loan applications for admin review.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    try:
        query = supabase_client.table("loans").select("*").order("created_at", desc=True)
        
        if status:
            query = query.eq("status", status)
            
        response = query.execute()
        return {"loans": response.data, "total": len(response.data)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/loans/status")
async def update_loan_status(update: LoanStatusUpdate):
    """
    Update the status of a loan application.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    valid_statuses = ["PENDING", "APPROVED", "REJECTED"]
    if update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    try:
        update_data = {"status": update.status}
        if update.remarks:
            update_data["admin_remarks"] = update.remarks

        response = supabase_client.table("loans").update(update_data).eq("id", update.loan_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )

        # Send notification
        # In a real app, we would fetch the user's email from the loan record or auth system
        # For now, we'll try to get it from the loan data if available, or just log it
        loan_data = response.data[0]
        user_id = loan_data.get("user_id")
        
        # Try to fetch user email if we have user_id (optional, depends on auth setup)
        # For this prototype, we'll assume we might not have it and just log
        await notification_service.send_status_update(
            loan_id=str(update.loan_id),
            new_status=update.status,
            applicant_email=None # Pass email if available in loan_data
        )

        return {
            "message": "Loan status updated successfully",
            "loan": loan_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/stats")
async def get_dashboard_stats():
    """
    Get dashboard statistics for admin.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    try:
        # Fetch all loans
        response = supabase_client.table("loans").select("*").execute()
        loans = response.data

        # Calculate stats
        total_loans = len(loans)
        pending = sum(1 for l in loans if l.get("status") == "PENDING")
        approved = sum(1 for l in loans if l.get("status") == "APPROVED")
        rejected = sum(1 for l in loans if l.get("status") == "REJECTED")
        total_amount = sum(l.get("amount", 0) for l in loans)

        return {
            "total_loans": total_loans,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "total_amount_requested": total_amount
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
