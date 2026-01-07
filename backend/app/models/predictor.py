"""
Risk Predictor with EMI-based calculation
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn. preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os

class RiskPredictor:
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.interest_rate = 0.10
    
    def train_model(self):
        print("Training risk model...")
        
        # Use simple training data
        np.random.seed(42)
        n_samples = 500
        
        X = np.random. rand(n_samples, 5)
        y = (X[:, 0] * 0.3 + X[:, 1] * 0.3 + X[:, 2] * 0.2 + np.random.rand(n_samples) * 0.2 > 0.5).astype(int)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        
        self.scaler.fit(X_train)
        X_train_scaled = self.scaler. transform(X_train)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model. fit(X_train_scaled, y_train)
        self.is_trained = True
        print("Model trained!")
    
    def calculate_emi(self, principal, tenure_months):
        if principal <= 0 or tenure_months <= 0:
            return 0
        monthly_rate = self.interest_rate / 12
        emi = principal * monthly_rate * pow(1 + monthly_rate, tenure_months) / (pow(1 + monthly_rate, tenure_months) - 1)
        return emi
    
    def predict(self, data:  dict) -> dict:
        annual_income = data. get("annual_income", 0)
        monthly_income = annual_income / 12 if annual_income > 0 else 1
        monthly_expenses = data. get("monthly_expenses", 0)
        loan_amount = data. get("loan_amount_requested", 0)
        tenure_months = data. get("loan_tenure_months", 36)
        existing_debt = data.get("existing_loan_amount", 0)
        employment_years = data. get("employment_years", 0)
        customer_score = data. get("customer_score", 600)
        has_mismatch = data. get("has_expense_mismatch", False)
        
        monthly_emi = self.calculate_emi(loan_amount, tenure_months)
        monthly_disposable = monthly_income - monthly_expenses
        
        emi_to_income = monthly_emi / monthly_income if monthly_income > 0 else 1
        emi_to_disposable = monthly_emi / monthly_disposable if monthly_disposable > 0 else 1
        
        # Calculate risk based on EMI affordability
        if emi_to_income <= 0.10:
            risk = 0.10
        elif emi_to_income <= 0.20:
            risk = 0.20
        elif emi_to_income <= 0.30:
            risk = 0.35
        elif emi_to_income <= 0.40:
            risk = 0.50
        elif emi_to_income <= 0.50:
            risk = 0.65
        else:
            risk = 0.80
        
        # Adjust for disposable income
        if emi_to_disposable > 0.70:
            risk = min(0.95, risk + 0.15)
        elif emi_to_disposable > 0.50:
            risk = min(0.90, risk + 0.10)
        
        # Adjust for customer score
        if customer_score >= 750:
            risk = max(0.05, risk - 0.15)
        elif customer_score >= 650:
            risk = max(0.05, risk - 0.10)
        elif customer_score < 450:
            risk = min(0.95, risk + 0.15)
        
        # Adjust for expense mismatch (fraud indicator)
        if has_mismatch: 
            risk = min(0.95, risk + 0.20)
        
        # Adjust for employment
        if employment_years >= 5:
            risk = max(0.05, risk - 0.05)
        elif employment_years < 1:
            risk = min(0.90, risk + 0.10)
        
        # Determine category and decision
        if risk < 0.25:
            category = "LOW"
            decision = "AUTO_APPROVE"
        elif risk < 0.50:
            category = "MEDIUM"
            decision = "MANUAL_REVIEW"
        else:
            category = "HIGH"
            decision = "AUTO_REJECT"
        
        # Calculate max loan
        max_emi = monthly_disposable * 0.4
        max_loan = max_emi * (pow(1 + self.interest_rate/12, tenure_months) - 1) / ((self.interest_rate/12) * pow(1 + self. interest_rate/12, tenure_months))
        max_loan = max(0, max_loan - existing_debt)
        
        # Risk factors
        factors = []
        if emi_to_income > 0.30:
            factors. append("EMI is " + str(round(emi_to_income * 100, 1)) + "% of income")
        if emi_to_disposable > 0.50:
            factors.append("EMI is " + str(round(emi_to_disposable * 100, 1)) + "% of disposable income")
        if customer_score < 550:
            factors. append("Low customer score:  " + str(customer_score))
        if has_mismatch: 
            factors.append("Expense mismatch detected")
        if employment_years < 2:
            factors. append("Short employment history")
        if not factors:
            factors.append("Good financial profile")
        
        # Recommendation
        if decision == "AUTO_APPROVE":
            recommendation = "Low risk.  Loan can be auto-approved."
        elif decision == "MANUAL_REVIEW": 
            recommendation = "Medium risk. Manual review required."
        else:
            recommendation = "High risk.  Loan should be rejected."
        
        return {
            "risk_score": round(risk, 4),
            "risk_percentage": round(risk * 100, 1),
            "risk_category": category,
            "decision":  decision,
            "monthly_emi": round(monthly_emi, 2),
            "emi_to_income_ratio": round(emi_to_income * 100, 1),
            "max_recommended_loan": round(max_loan, 2),
            "risk_factors": factors,
            "recommendation": recommendation
        }
    
    def is_ready(self):
        return self.is_trained