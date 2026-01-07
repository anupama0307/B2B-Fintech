from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.sql import func
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Personal Info
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    date_of_birth = Column(String(20))
    gender = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    
    # Professional Info
    occupation = Column(String(100))
    employer_name = Column(String(255))
    employment_years = Column(Integer, default=0)
    annual_income = Column(Float, default=0)
    monthly_expenses = Column(Float, default=0)
    
    # Financial Info
    pan_number = Column(String(20))
    aadhar_number = Column(String(20))
    bank_name = Column(String(100))
    account_number = Column(String(50))
    account_balance = Column(Float, default=0)
    mutual_funds = Column(Float, default=0)
    stocks = Column(Float, default=0)
    fixed_deposits = Column(Float, default=0)
    other_investments = Column(Float, default=0)
    existing_loans = Column(Integer, default=0)
    existing_loan_amount = Column(Float, default=0)
    
    # Bank Statement Analysis
    statement_expenses = Column(Float, default=0)  # Expenses from parsed statement
    expense_mismatch = Column(Boolean, default=False)  # True if stated != actual
    expense_mismatch_percent = Column(Float, default=0)
    
    # Customer Score
    customer_score = Column(Integer, default=0)  # 0-900
    
    # Account Info
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    otp = Column(String(10), nullable=True)
    otp_expires = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func. now())
    updated_at = Column(DateTime, onupdate=func. now())