"""
AI Response Generator for Grievances
Generates personalized rejection explanations
"""

def generate_rejection_explanation(loan_data: dict, user_data: dict) -> str:
    """
    Generate AI explanation for loan rejection
    """
    
    reasons = []
    suggestions = []
    
    risk_score = loan_data.get("risk_score", 0.5)
    risk_category = loan_data.get("risk_category", "HIGH")
    loan_amount = loan_data.get("loan_amount", 0)
    monthly_emi = loan_data.get("monthly_emi", 0)
    
    annual_income = user_data.get("annual_income", 0)
    monthly_income = annual_income / 12 if annual_income > 0 else 0
    monthly_expenses = user_data.get("monthly_expenses", 0)
    existing_loan_amount = user_data.get("existing_loan_amount", 0)
    customer_score = user_data.get("customer_score", 0)
    employment_years = user_data.get("employment_years", 0)
    expense_mismatch = user_data.get("expense_mismatch", False)
    
    # Analyze rejection reasons
    if monthly_income > 0:
        emi_ratio = monthly_emi / monthly_income
        if emi_ratio > 0.4:
            reasons. append("The monthly EMI (₹" + str(int(monthly_emi)) + ") would be " + str(round(emi_ratio * 100, 1)) + "% of your monthly income, which exceeds the recommended 40% threshold.")
            suggestions.append("Consider a smaller loan amount or longer tenure to reduce EMI.")
    
    if annual_income > 0:
        debt_ratio = (existing_loan_amount + loan_amount) / annual_income
        if debt_ratio > 0.5:
            reasons. append("Your total debt (including this loan) would be " + str(round(debt_ratio * 100, 1)) + "% of your annual income.")
            suggestions.append("Pay off some existing loans before applying for a new one.")
    
    if customer_score < 550:
        reasons. append("Your Customer Score of " + str(customer_score) + " is below the minimum requirement of 550.")
        suggestions.append("Improve your score by maintaining regular savings and reducing expenses.")
    
    if employment_years < 1:
        reasons. append("Less than 1 year of employment history indicates job instability.")
        suggestions.append("Apply after completing at least 1 year at your current job.")
    
    if expense_mismatch:
        reasons.append("There is a significant discrepancy between your stated expenses and your bank statement.")
        suggestions. append("Upload a recent bank statement and ensure your stated expenses are accurate.")
    
    if monthly_income > 0 and monthly_expenses / monthly_income > 0.7:
        reasons. append("Your expenses consume " + str(round((monthly_expenses / monthly_income) * 100, 1)) + "% of your income, leaving insufficient room for EMI payments.")
        suggestions. append("Reduce your monthly expenses to improve loan eligibility.")
    
    # Build response
    response = "Dear Customer,\n\n"
    response += "Thank you for your loan application. After careful review, we regret to inform you that your application could not be approved at this time.\n\n"
    
    if reasons:
        response += "**Reasons for Rejection:**\n"
        for i, reason in enumerate(reasons, 1):
            response += str(i) + ". " + reason + "\n"
        response += "\n"
    
    if suggestions:
        response += "**How to Improve Your Chances:**\n"
        for i, suggestion in enumerate(suggestions, 1):
            response += str(i) + ". " + suggestion + "\n"
        response += "\n"
    
    response += "You may reapply after addressing the above points.  If you have any questions, please contact our support team.\n\n"
    response += "Best regards,\nRISKON Team"
    
    return response


def generate_grievance_response(grievance: dict, loan_data: dict = None) -> str:
    """
    Generate AI response for customer grievance
    """
    
    grievance_type = grievance.get("grievance_type", "other")
    
    if grievance_type == "rejection_query" and loan_data: 
        return generate_rejection_explanation(loan_data, {})
    
    # Generic response for other grievances
    response = "Dear Customer,\n\n"
    response += "Thank you for reaching out to us regarding your concern.\n\n"
    response += "We have reviewed your query and our team is working on resolving it.  "
    response += "You can expect a detailed response within 2-3 business days.\n\n"
    response += "If you have any additional information to provide, please reply to this ticket.\n\n"
    response += "Best regards,\nRISKON Support Team"
    
    return response