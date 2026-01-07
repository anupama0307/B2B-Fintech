from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app. database. database import get_db
from app.database. schemas import UserRegister, UserLogin, OTPVerify, Token
from app.models.user import User
from app.utils. security import hash_password, verify_password, create_access_token
from app.services.otp_service import generate_otp, send_otp_email, get_otp_expiry, is_otp_valid
from app.services.score_service import calculate_customer_score

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    otp = generate_otp()
    
    user = User(
        email=data.email,
        password_hash=hash_password(data. password),
        full_name=data. full_name,
        phone=data. phone,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        address=data.address,
        city=data. city,
        state=data.state,
        pincode=data.pincode,
        occupation=data.occupation,
        employer_name=data.employer_name,
        employment_years=data.employment_years,
        annual_income=data. annual_income,
        monthly_expenses=data.monthly_expenses,
        pan_number=data.pan_number,
        aadhar_number=data.aadhar_number,
        account_balance=data.account_balance,
        mutual_funds=data.mutual_funds,
        stocks=data.stocks,
        fixed_deposits=data.fixed_deposits,
        existing_loans=data.existing_loans,
        existing_loan_amount=data. existing_loan_amount,
        otp=otp,
        otp_expires=get_otp_expiry()
    )
    
    # Calculate initial customer score
    score_result = calculate_customer_score(data. dict())
    user.customer_score = score_result["score"]
    
    db.add(user)
    db.commit()
    
    send_otp_email(data. email, otp)
    
    return {"message": "Registration successful!  OTP sent to email.", "email": data.email}

@router.post("/verify-otp", response_model=Token)
def verify_otp_route(data: OTPVerify, db:  Session = Depends(get_db)):
    user = db. query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not is_otp_valid(user. otp, data. otp, user. otp_expires):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user.is_verified = True
    user. otp = None
    db.commit()
    
    token = create_access_token({"user_id": user. id, "email": user. email, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user":  {
            "id": user.id,
            "email":  user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    
    otp = generate_otp()
    user.otp = otp
    user. otp_expires = get_otp_expiry()
    db.commit()
    
    send_otp_email(data.email, otp)
    
    return {"message": "OTP sent to your email", "email": data. email, "requires_otp": True}

@router. post("/login/verify", response_model=Token)
def login_verify(data:  OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    
    if not is_otp_valid(user.otp, data.otp, user.otp_expires):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user.otp = None
    user.is_verified = True
    db.commit()
    
    token = create_access_token({"user_id":  user.id, "email": user.email, "role": user.role})
    
    return {
        "access_token": token,
        "token_type":  "bearer",
        "user": {
            "id": user.id,
            "email": user. email,
            "full_name": user.full_name,
            "role":  user.role
        }
    }

@router.post("/resend-otp")
def resend_otp(email: str, db:  Session = Depends(get_db)):
    user = db. query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp = generate_otp()
    user.otp = otp
    user.otp_expires = get_otp_expiry()
    db.commit()
    
    send_otp_email(email, otp)
    
    return {"message": "OTP resent successfully"}