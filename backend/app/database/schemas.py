from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ============ AUTH ============

class UserRegister(BaseModel):
    email: EmailStr
    password:  str
    full_name: str
    phone: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode:  Optional[str] = None
    occupation: Optional[str] = None
    employer_name: Optional[str] = None
    employment_years:  Optional[int] = 0
    annual_income: Optional[float] = 0
    monthly_expenses:  Optional[float] = 0
    pan_number: Optional[str] = None
    aadhar_number: Optional[str] = None
    account_balance: Optional[float] = 0
    mutual_funds: Optional[float] = 0
    stocks:  Optional[float] = 0
    fixed_deposits: Optional[float] = 0
    existing_loans: Optional[int] = 0
    existing_loan_amount: Optional[float] = 0

class UserLogin(BaseModel):
    email: EmailStr
    password:  str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class Token(BaseModel):
    access_token:  str
    token_type: str
    user:  dict

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    phone: str
    role: str
    occupation: Optional[str]
    annual_income: Optional[float]
    monthly_expenses: Optional[float]
    account_balance: Optional[float]
    customer_score: Optional[int]
    expense_mismatch:  Optional[bool]
    
    class Config: 
        from_attributes = True

# ============ LOAN ============

class LoanCreate(BaseModel):
    loan_type:  str
    loan_provider: Optional[str] = "RISKON Bank"
    loan_amount: float
    loan_tenure_months:  int
    loan_purpose: Optional[str] = None

class LoanResponse(BaseModel):
    id: int
    loan_type:  str
    loan_provider: str
    loan_amount: float
    loan_tenure_months: int
    risk_score: float
    risk_category:  str
    monthly_emi: float
    status: str
    auto_decision: bool
    rejection_reason: Optional[str]
    ai_rejection_reason:  Optional[str]
    applied_at: datetime
    
    class Config: 
        from_attributes = True

class LoanStatusUpdate(BaseModel):
    status: str
    admin_remarks: Optional[str] = None
    rejection_reason:  Optional[str] = None
    approved_amount: Optional[float] = None
    interest_rate: Optional[float] = None

# ============ GRIEVANCE ============

class GrievanceCreate(BaseModel):
    loan_id: Optional[int] = None
    subject: str
    description: str
    grievance_type: Optional[str] = "other"

class GrievanceResponse(BaseModel):
    id: int
    subject: str
    description: str
    status: str
    admin_response: Optional[str]
    ai_suggested_response:  Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class GrievanceReply(BaseModel):
    status: str
    admin_response: str

# ============ RISK ANALYSIS ============

class RiskAnalysisRequest(BaseModel):
    age: int
    annual_income: float
    employment_years: int
    existing_loan_amount: float
    monthly_expenses: float
    loan_amount_requested: float
    loan_tenure_months:  int
    customer_score: Optional[int] = 600
    has_expense_mismatch:  Optional[bool] = False

class RiskAnalysisResponse(BaseModel):
    risk_score: float
    risk_percentage: float
    risk_category: str
    decision: str
    monthly_emi: float
    emi_to_income_ratio: float
    max_recommended_loan:  float
    risk_factors: List[str]
    recommendation: str

# ============ DASHBOARD ============

class AdminStats(BaseModel):
    total_applications:  int
    pending_applications: int
    approved_applications: int
    rejected_applications: int
    auto_approved:  int
    auto_rejected: int
    total_disbursed: float
    open_grievances: int
    fraud_alerts: int

class UserDashboard(BaseModel):
    customer_score: int
    total_assets: float
    monthly_income: float
    monthly_expenses: float
    statement_expenses: float
    expense_mismatch:  bool
    expense_mismatch_percent: float
    spending_breakdown: List[dict]
    income_vs_expense: List[dict]
    loan_summary: dict