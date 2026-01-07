"""
Bank Statement Parser Service
Parses CSV bank statements and categorizes transactions
"""

import pandas as pd
from typing import List, Dict
import re

# Keywords for categorization
CATEGORIES = {
    "food": ["swiggy", "zomato", "restaurant", "cafe", "food", "dining", "pizza", "burger", "kitchen"],
    "shopping": ["amazon", "flipkart", "myntra", "ajio", "mall", "mart", "store", "shop"],
    "bills":  ["electricity", "water", "gas", "internet", "broadband", "dth", "recharge", "mobile"],
    "transport": ["uber", "ola", "rapido", "petrol", "diesel", "fuel", "metro", "bus"],
    "entertainment": ["netflix", "spotify", "prime", "hotstar", "movie", "theatre", "gaming"],
    "health": ["hospital", "clinic", "medical", "pharmacy", "medicine", "doctor", "lab"],
    "education": ["school", "college", "course", "udemy", "coursera", "books", "tuition"],
    "investment": ["mutual", "fund", "sip", "stock", "share", "demat", "zerodha", "groww"],
    "rent": ["rent", "house", "apartment", "pg", "hostel"],
    "transfer": ["transfer", "neft", "imps", "upi", "rtgs"],
    "atm": ["atm", "cash", "withdrawal"],
    "salary": ["salary", "wages", "income", "credit"]
}

def categorize_transaction(description: str) -> str:
    """Categorize a transaction based on description"""
    description = description.lower()
    
    for category, keywords in CATEGORIES.items():
        for keyword in keywords: 
            if keyword in description:
                return category
    
    return "other"

def parse_bank_statement(file_content: str, file_type: str = "csv") -> Dict:
    """
    Parse bank statement and return analysis
    """
    try:
        # Parse CSV
        lines = file_content. strip().split('\n')
        
        # Simple parsing - assume columns:  Date, Description, Debit, Credit, Balance
        transactions = []
        total_debit = 0
        total_credit = 0
        category_totals = {}
        
        for line in lines[1:]:  # Skip header
            parts = line.split(',')
            if len(parts) >= 4:
                try:
                    date = parts[0].strip()
                    description = parts[1].strip()
                    debit = float(parts[2].strip() or 0)
                    credit = float(parts[3].strip() or 0)
                    
                    category = categorize_transaction(description)
                    
                    if debit > 0:
                        total_debit += debit
                        category_totals[category] = category_totals.get(category, 0) + debit
                    
                    if credit > 0:
                        total_credit += credit
                    
                    transactions. append({
                        "date": date,
                        "description": description,
                        "debit":  debit,
                        "credit": credit,
                        "category": category
                    })
                except:
                    continue
        
        # Calculate monthly average (assume 3 months of data)
        monthly_expenses = total_debit / 3
        monthly_income = total_credit / 3
        
        # Spending breakdown
        spending_breakdown = [
            {"category":  cat, "amount": amt, "percentage": round((amt / total_debit) * 100, 1)}
            for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        ]
        
        return {
            "success": True,
            "total_transactions": len(transactions),
            "total_debit": total_debit,
            "total_credit": total_credit,
            "monthly_expenses": monthly_expenses,
            "monthly_income": monthly_income,
            "spending_breakdown": spending_breakdown,
            "transactions": transactions[: 50]  # Return last 50
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }