"""
Grievances router for RISKOFF API.
Handles user support tickets and admin responses.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.config import supabase_client
from app.schemas import GrievanceCreate, GrievanceResponse, GrievanceReply
from app.utils.security import get_current_user, CurrentUser

router = APIRouter(
    prefix="/grievances",
    tags=["Grievances"]
)


# ============ User Endpoints ============

@router.post("/submit", response_model=GrievanceResponse)
async def submit_grievance(
    grievance: GrievanceCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Submit a new grievance/support ticket.
    
    Requires authentication.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )
    
    try:
        # Prepare grievance data - only include fields that exist in DB
        # Note: grievance_type column may not exist in all DB schemas
        grievance_data = {
            "user_id": current_user.id,
            "subject": grievance.subject,
            "description": grievance.description,
            "status": "open"
        }
        
        # Insert into database
        response = supabase_client.table("grievances").insert(grievance_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create grievance"
            )
        
        record = response.data[0]
        
        return GrievanceResponse(
            id=str(record.get("id")),
            user_id=record.get("user_id"),
            grievance_type=record.get("grievance_type"),
            subject=record.get("subject"),
            description=record.get("description"),
            status=record.get("status"),
            admin_response=record.get("admin_response"),
            created_at=str(record.get("created_at")),
            resolved_at=record.get("resolved_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/my-grievances", response_model=List[GrievanceResponse])
async def get_my_grievances(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all grievances submitted by the current user.
    
    Requires authentication.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )
    
    try:
        response = supabase_client.table("grievances").select("*").eq(
            "user_id", current_user.id
        ).order("created_at", desc=True).execute()
        
        grievances = []
        for record in response.data:
            grievances.append(GrievanceResponse(
                id=str(record.get("id")),
                user_id=record.get("user_id"),
                grievance_type=record.get("grievance_type"),
                subject=record.get("subject"),
                description=record.get("description"),
                status=record.get("status"),
                admin_response=record.get("admin_response"),
                created_at=str(record.get("created_at")),
                resolved_at=record.get("resolved_at")
            ))
        
        return grievances
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ============ Admin Endpoints ============

@router.get("/admin/all")
async def get_all_grievances(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all grievances from all users with user info.
    
    Requires admin role.
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )
    
    try:
        # Fetch grievances - we'll enrich with user info separately
        response = supabase_client.table("grievances").select("*").order(
            "created_at", desc=True
        ).execute()
        
        grievances = []
        for record in response.data or []:
            # Get user info from profiles table
            user_name = "Unknown User"
            user_email = ""
            user_id = record.get("user_id")
            
            if user_id:
                try:
                    profile_response = supabase_client.table("profiles").select(
                        "full_name, email"
                    ).eq("id", user_id).limit(1).execute()
                    
                    if profile_response.data:
                        profile = profile_response.data[0]
                        user_name = profile.get("full_name") or "Unknown User"
                        user_email = profile.get("email") or ""
                except:
                    pass  # Keep defaults
            
            grievances.append({
                "id": str(record.get("id")),
                "user_id": user_id,
                "user_name": user_name,
                "user_email": user_email,
                "subject": record.get("subject"),
                "description": record.get("description"),
                "status": record.get("status") or "open",
                "grievance_type": record.get("grievance_type"),
                "admin_response": record.get("admin_response"),
                "created_at": str(record.get("created_at")),
                "resolved_at": record.get("resolved_at")
            })
        
        return grievances
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/admin/{grievance_id}")
async def reply_to_grievance(
    grievance_id: int,
    reply: GrievanceReply,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Reply to a grievance and update its status.
    
    Requires admin role.
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )
    
    try:
        # Check if grievance exists
        check = supabase_client.table("grievances").select("id").eq(
            "id", grievance_id
        ).execute()
        
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grievance not found"
            )
        
        # Prepare update data - ONLY status and admin_response (no resolved_at)
        update_data = {
            "status": reply.status,
            "admin_response": reply.admin_response
        }
        
        # Update grievance
        response = supabase_client.table("grievances").update(update_data).eq(
            "id", grievance_id
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update grievance"
            )
        
        return {
            "status": "success",
            "message": f"Grievance {grievance_id} updated successfully",
            "data": response.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
