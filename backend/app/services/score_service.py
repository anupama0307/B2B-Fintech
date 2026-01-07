"""
Customer Score Calculation Service
Score Range: 0 - 900
"""

def calculate_customer_score(user_data: dict) -> dict:
    """
    Calculate customer score based on multiple factors
    Returns score and breakdown
    """
    
    score = 0
    breakdown = []
    
    annual_income = user_data.get("annual_income", 0)
    monthly_income = annual_income / 12 if annual_income > 0 else 0
    monthly_expenses = user_data.get("monthly_expenses", 0)
    statement_expenses = user_data.get("statement_expenses", 0)
    existing_loan_amount = user_data.get("existing_loan_amount", 0)
    employment_years = user_data.get("employment_years", 0)
    account_balance = user_data.get("account_balance", 0)
    investments = (
        user_data. get("mutual_funds", 0) +
        user_data.get("stocks", 0) +
        user_data. get("fixed_deposits", 0) +
        user_data.get("other_investments", 0)
    )
    
    # 1. Income Stability (20% = 180 points)
    if annual_income >= 1200000:  # 12L+
        income_score = 180
    elif annual_income >= 600000:  # 6L+
        income_score = 150
    elif annual_income >= 300000:  # 3L+
        income_score = 120
    elif annual_income >= 100000:  # 1L+
        income_score = 80
    else: 
        income_score = 40
    score += income_score
    breakdown.append({"factor": "Income Stability", "score":  income_score, "max": 180})
    
    # 2. Expense Management (20% = 180 points)
    if monthly_income > 0:
        expense_ratio = monthly_expenses / monthly_income
        if expense_ratio <= 0.3:
            expense_score = 180
        elif expense_ratio <= 0.5:
            expense_score = 140
        elif expense_ratio <= 0.7:
            expense_score = 100
        else: 
            expense_score = 50
    else:
        expense_score = 0
    score += expense_score
    breakdown.append({"factor": "Expense Management", "score": expense_score, "max": 180})
    
    # 3. Savings Rate (15% = 135 points)
    if monthly_income > 0:
        savings = monthly_income - monthly_expenses
        savings_rate = savings / monthly_income
        if savings_rate >= 0.4:
            savings_score = 135
        elif savings_rate >= 0.25:
            savings_score = 100
        elif savings_rate >= 0.1:
            savings_score = 60
        else: 
            savings_score = 20
    else: 
        savings_score = 0
    score += savings_score
    breakdown.append({"factor": "Savings Rate", "score": savings_score, "max": 135})
    
    # 4. Debt-to-Income Ratio (15% = 135 points)
    if annual_income > 0:
        dti = existing_loan_amount / annual_income
        if dti == 0:
            dti_score = 135
        elif dti <= 0.2:
            dti_score = 110
        elif dti <= 0.4:
            dti_score = 80
        elif dti <= 0.6:
            dti_score = 50
        else: 
            dti_score = 20
    else: 
        dti_score = 0
    score += dti_score
    breakdown. append({"factor":  "Debt-to-Income", "score": dti_score, "max": 135})
    
    # 5. Employment Stability (10% = 90 points)
    if employment_years >= 10:
        emp_score = 90
    elif employment_years >= 5:
        emp_score = 75
    elif employment_years >= 2:
        emp_score = 55
    elif employment_years >= 1:
        emp_score = 35
    else: 
        emp_score = 15
    score += emp_score
    breakdown.append({"factor": "Employment Stability", "score": emp_score, "max": 90})
    
    # 6. Expense Verification (10% = 90 points)
    if statement_expenses > 0 and monthly_expenses > 0:
        diff = abs(statement_expenses - monthly_expenses)
        diff_percent = (diff / monthly_expenses) * 100
        
        if diff_percent <= 10:
            verify_score = 90
            mismatch = False
        elif diff_percent <= 25:
            verify_score = 60
            mismatch = False
        elif diff_percent <= 50:
            verify_score = 30
            mismatch = True
        else: 
            verify_score = 0
            mismatch = True
    else:
        verify_score = 45  # No statement uploaded
        mismatch = False
        diff_percent = 0
    score += verify_score
    breakdown.append({"factor": "Expense Verification", "score": verify_score, "max": 90})
    
    # 7. Assets & Investments (5% = 45 points)
    total_assets = account_balance + investments
    if total_assets >= annual_income:
        asset_score = 45
    elif total_assets >= annual_income * 0.5:
        asset_score = 35
    elif total_assets >= annual_income * 0.25:
        asset_score = 25
    else:
        asset_score = 10
    score += asset_score
    breakdown.append({"factor": "Assets & Investments", "score":  asset_score, "max": 45})
    
    # 8. Account Balance (5% = 45 points)
    if monthly_income > 0:
        balance_months = account_balance / monthly_income if monthly_income > 0 else 0
        if balance_months >= 6:
            balance_score = 45
        elif balance_months >= 3:
            balance_score = 35
        elif balance_months >= 1:
            balance_score = 20
        else: 
            balance_score = 10
    else:
        balance_score = 10
    score += balance_score
    breakdown.append({"factor": "Account Balance", "score": balance_score, "max":  45})
    
    # Determine grade
    if score >= 750:
        grade = "Excellent"
    elif score >= 650:
        grade = "Good"
    elif score >= 550:
        grade = "Fair"
    elif score >= 400:
        grade = "Poor"
    else:
        grade = "Very Poor"
    
    return {
        "score": score,
        "max_score": 900,
        "grade": grade,
        "breakdown": breakdown,
        "expense_mismatch": mismatch if 'mismatch' in dir() else False,
        "mismatch_percent":  diff_percent if 'diff_percent' in dir() else 0
    }