from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Loan Details
    loan_type = Column(String(50), nullable=False)
    loan_provider = Column(String(100), default="RISKON Bank")
    loan_amount = Column(Float, nullable=False)
    loan_tenure_months = Column(Integer, nullable=False)
    loan_purpose = Column(Text)
    
    # Risk Assessment
    risk_score = Column(Float, default=0)
    risk_category = Column(String(20))
    monthly_emi = Column(Float, default=0)
    emi_to_income_ratio = Column(Float, default=0)
    max_recommended_loan = Column(Float, default=0)
    customer_score_at_application = Column(Integer, default=0)
    
    # Status
    status = Column(String(20), default="pending")
    auto_decision = Column(Boolean, default=False)  # True if auto-approved/rejected
    
    # Admin Response
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_remarks = Column(Text)
    rejection_reason = Column(Text)
    ai_rejection_reason = Column(Text)  # AI-generated reason
    approved_amount = Column(Float, nullable=True)
    approved_tenure = Column(Integer, nullable=True)
    interest_rate = Column(Float, nullable=True)
    
    # Timestamps
    applied_at = Column(DateTime, server_default=func.now())
    reviewed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])