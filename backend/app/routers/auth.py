"""
Authentication router for RISKOFF API.
Handles user signup, login with OTP, and session management.
With rate limiting for security.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from slowapi import Limiter
from slowapi.util import get_remote_address
import random
import string
from datetime import datetime, timedelta

from app.config import supabase_client
from app.schemas import UserSignup, UserLogin
from app.utils.security import get_current_user, CurrentUser

# Rate limiter for auth endpoints
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# In-memory OTP storage (for production, use Redis)
# Format: {email: {"otp": "123456", "expires": datetime, "user_data": {...}}}
otp_storage: Dict[str, dict] = {}


class AuthResponse(BaseModel):
    """Response model for authentication endpoints."""
    message: str
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: str = "user"
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class OTPResponse(BaseModel):
    """Response for login step 1 (OTP sent)."""
    message: str
    otp_required: bool = True
    email: str


class VerifyOTPRequest(BaseModel):
    """Request for OTP verification."""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email: str, otp: str, full_name: str = None):
    """
    Send OTP to user's email.
    In production, integrate with email service (SendGrid, SES, etc.)
    For now, we'll print it to console for testing.
    """
    print(f"\n{'='*50}")
    print(f"OTP for {email}: {otp}")
    print(f"Valid for 5 minutes")
    print(f"{'='*50}\n")
    
    # TODO: Integrate with actual email service
    # Example with SendGrid:
    # sendgrid.send(
    #     to=email,
    #     subject="Your RISKOFF Login OTP",
    #     body=f"Hello {full_name or 'User'},\n\nYour OTP is: {otp}\n\nValid for 5 minutes."
    # )


@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(request: Request, user: UserSignup) -> AuthResponse:
    """
    Register a new user with Supabase Auth.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

    try:
        auth_response = supabase_client.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "full_name": user.full_name,
                    "phone": user.phone
                }
            }
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        if not auth_response.session:
            return {
                "message": "Registration successful. Please check your email to confirm your account.",
                "user_id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": user.full_name,
                "role": "user",
                "access_token": "",
                "refresh_token": "",
                "token_type": "bearer"
            }

        return AuthResponse(
            message="User registered successfully",
            user_id=auth_response.user.id,
            email=auth_response.user.email,
            full_name=user.full_name,
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token
        )

    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e).lower()
        
        if "already registered" in error_message or "already exists" in error_message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists"
            )
        elif "invalid email" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email address format"
            )
        elif "password" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet requirements (min 6 characters)"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}"
            )


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, user: UserLogin) -> OTPResponse:
    """
    Step 1: Authenticate user credentials and send OTP.
    
    Returns OTPResponse indicating OTP has been sent to email.
    User must then call /auth/verify-otp with the OTP.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

    try:
        # Verify credentials with Supabase
        auth_response = supabase_client.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user_metadata = auth_response.user.user_metadata or {}
        
        # Fetch role AND full_name from profiles table (to get latest updated data)
        user_role = "user"
        profile_full_name = user_metadata.get("full_name")  # Default from signup data
        try:
            profile_response = supabase_client.table("profiles").select("role, full_name").eq(
                "id", auth_response.user.id
            ).execute()
            if profile_response.data and len(profile_response.data) > 0:
                user_role = profile_response.data[0].get("role", "user")
                # Use profile full_name if it exists, otherwise use signup metadata
                if profile_response.data[0].get("full_name"):
                    profile_full_name = profile_response.data[0].get("full_name")
        except Exception:
            pass

        # Generate OTP
        otp = generate_otp()
        
        # Store OTP with user data (expires in 5 minutes)
        otp_storage[user.email.lower()] = {
            "otp": otp,
            "expires": datetime.utcnow() + timedelta(minutes=5),
            "user_data": {
                "user_id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": profile_full_name,  # Use profile data, not signup metadata
                "role": user_role,
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token
            }
        }
        
        # Send OTP
        send_otp_email(user.email, otp, profile_full_name)
        
        return OTPResponse(
            message="OTP sent to your email. Please verify to complete login.",
            otp_required=True,
            email=user.email
        )

    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e).lower()
        
        if "invalid" in error_message or "credentials" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        elif "not confirmed" in error_message:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please confirm your email address before logging in"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Login failed: {str(e)}"
            )


@router.post("/verify-otp")
@limiter.limit("5/minute")
async def verify_otp(request: Request, otp_request: VerifyOTPRequest) -> AuthResponse:
    """
    Step 2: Verify OTP and return authentication tokens.
    
    This completes the login process after OTP is verified.
    """
    email = otp_request.email.lower()
    
    # Check if OTP exists for this email
    if email not in otp_storage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Please login again."
        )
    
    stored_data = otp_storage[email]
    
    # Check if OTP expired
    if datetime.utcnow() > stored_data["expires"]:
        del otp_storage[email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please login again."
        )
    
    # Verify OTP
    if otp_request.otp != stored_data["otp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please try again."
        )
    
    # OTP verified successfully - return tokens
    user_data = stored_data["user_data"]
    
    # Remove used OTP
    del otp_storage[email]
    
    return AuthResponse(
        message="Login successful",
        user_id=user_data["user_id"],
        email=user_data["email"],
        full_name=user_data["full_name"],
        role=user_data["role"],
        access_token=user_data["access_token"],
        refresh_token=user_data["refresh_token"]
    )


@router.post("/resend-otp")
@limiter.limit("3/minute")
async def resend_otp(request: Request, email: EmailStr):
    """Resend OTP for pending login."""
    email_lower = email.lower()
    
    if email_lower not in otp_storage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending login found. Please login again."
        )
    
    stored_data = otp_storage[email_lower]
    
    # Generate new OTP
    new_otp = generate_otp()
    stored_data["otp"] = new_otp
    stored_data["expires"] = datetime.utcnow() + timedelta(minutes=5)
    
    # Send new OTP
    send_otp_email(email, new_otp, stored_data["user_data"].get("full_name"))
    
    return {"message": "New OTP sent to your email"}


@router.post("/login/form")
async def login_form(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 compatible login endpoint for Swagger UI."""
    user = UserLogin(email=form_data.username, password=form_data.password)
    return await login(request, user)


@router.post("/logout")
async def logout(current_user: CurrentUser = Depends(get_current_user)):
    """Sign out the current user."""
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

    try:
        supabase_client.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}"
        )


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh the access token using a refresh token."""
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

    try:
        auth_response = supabase_client.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.get("/me")
async def get_current_user_info(current_user: CurrentUser = Depends(get_current_user)):
    """Get current authenticated user's information."""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role
    }
