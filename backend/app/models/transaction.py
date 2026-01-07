from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    transaction_date = Column(DateTime)
    description = Column(Text)
    amount = Column(Float)
    transaction_type = Column(String(20))  # credit/debit
    category = Column(String(50))  # food, shopping, bills, transfer, etc.
    
    created_at = Column(DateTime, server_default=func.now())