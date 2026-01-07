from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy. orm import relationship
from app.database.database import Base

class Grievance(Base):
    __tablename__ = "grievances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=True)
    
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    grievance_type = Column(String(50), default="other")
    
    status = Column(String(20), default="open")
    priority = Column(String(20), default="normal")
    
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_response = Column(Text)
    ai_suggested_response = Column(Text)  # AI-generated response
    
    created_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", foreign_keys=[user_id])
    loan = relationship("LoanApplication")