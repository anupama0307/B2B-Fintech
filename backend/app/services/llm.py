"""
LLM service for RISKOFF API.
Handles Gemini text generation for various AI features.
"""

from typing import Optional
from app.config import gemini_model


async def generate_loan_summary(
    amount: float,
    tenure_months: int,
    risk_score: float,
    risk_status: str
) -> str:
    """
    Generate a human-readable loan summary using Gemini AI.

    Args:
        amount: Loan amount
        tenure_months: Loan tenure in months
        risk_score: Calculated risk score
        risk_status: Risk status (LOW/MEDIUM/HIGH)

    Returns:
        Generated summary text
    """
    if not gemini_model:
        return f"Loan of ₹{amount:,.2f} for {tenure_months} months. Risk: {risk_status} ({risk_score:.1f}/100)"

    try:
        prompt = f"""Generate a brief, professional loan summary for a customer in 2-3 sentences.

        Loan Details:
        - Amount: ₹{amount:,.2f}
        - Tenure: {tenure_months} months
        - Risk Score: {risk_score}/100
        - Risk Status: {risk_status}

        Keep it friendly and informative. Do not include any disclaimers."""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        return f"Loan of ₹{amount:,.2f} for {tenure_months} months. Risk: {risk_status} ({risk_score:.1f}/100)"


async def generate_risk_explanation(
    score: float,
    status: str,
    reasons: list
) -> str:
    """
    Generate a detailed explanation of the risk assessment.

    Args:
        score: Risk score (0-100)
        status: Risk status (LOW/MEDIUM/HIGH)
        reasons: List of risk factors

    Returns:
        Generated explanation text
    """
    if not gemini_model:
        return f"Risk Status: {status} (Score: {score}). Factors: {', '.join(reasons)}"

    try:
        reasons_text = "\n".join(f"- {r}" for r in reasons)
        prompt = f"""Explain this loan risk assessment to a customer in simple, non-technical terms.

        Risk Score: {score}/100
        Risk Status: {status}
        Factors:
        {reasons_text}

        Provide a helpful 2-3 sentence explanation. Be encouraging if score is good, and provide actionable advice if score needs improvement."""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        return f"Risk Status: {status} (Score: {score}). Factors: {', '.join(reasons)}"


async def generate_voice_response(
    context: str,
    user_name: Optional[str] = None
) -> str:
    """
    Generate a conversational response for the Zudu voice agent.

    Args:
        context: Context about what the user is asking
        user_name: Optional user name for personalization

    Returns:
        Generated voice-friendly response
    """
    if not gemini_model:
        return f"I understand you're asking about {context}. Let me help you with that."

    try:
        name_prefix = f"The user's name is {user_name}. " if user_name else ""
        prompt = f"""{name_prefix}Generate a brief, friendly voice response for a fintech voice assistant.

        User Query Context: {context}

        Requirements:
        - Keep it under 50 words
        - Use natural, conversational language
        - Be helpful and professional
        - Suitable for text-to-speech"""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        return f"I understand you're asking about {context}. Let me help you with that."


async def analyze_spending_patterns(transactions: list) -> dict:
    """
    Analyze spending patterns from transaction data using Gemini.

    Args:
        transactions: List of transaction dictionaries

    Returns:
        Analysis results with categories and insights
    """
    if not gemini_model or not transactions:
        return {"analysis": "Unable to analyze spending patterns", "categories": {}}

    try:
        # Prepare transaction summary
        txn_summary = "\n".join([
            f"- {t.get('description', 'Unknown')}: ₹{t.get('amount', 0)}"
            for t in transactions[:50]  # Limit to 50 transactions
        ])

        prompt = f"""Analyze these bank transactions and categorize spending patterns.

        Transactions:
        {txn_summary}

        Return a JSON object with:
        {{
            "total_spending": 0,
            "categories": {{"Food": 0, "Transport": 0, "Shopping": 0, ...}},
            "insights": ["insight 1", "insight 2"],
            "recommendation": "brief recommendation"
        }}

        Return ONLY the JSON object."""

        response = gemini_model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean up response if wrapped in code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        import json
        return json.loads(response_text)

    except Exception as e:
        return {"analysis": f"Error analyzing patterns: {str(e)}", "categories": {}}


async def generate_rejection_reason(reasons: list) -> str:
    """
    Generate a polite, human-readable rejection explanation using Gemini AI.

    Args:
        reasons: List of risk factors that led to rejection

    Returns:
        A polite, helpful rejection message
    """
    if not gemini_model:
        return f"Unfortunately, your loan application could not be approved at this time. Factors considered: {', '.join(reasons)}. Please contact support for more information."

    try:
        reasons_text = "\n".join(f"- {r}" for r in reasons)
        prompt = f"""Generate a polite, empathetic loan rejection message for a customer.

        Rejection Reasons:
        {reasons_text}

        Requirements:
        - Be respectful and professional
        - Do not blame the customer
        - Keep it under 3 sentences
        - Suggest they can reapply after improving their financial situation
        - Do not include any specific numbers or technical jargon"""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        return f"Unfortunately, your loan application could not be approved at this time. We encourage you to review your financial profile and apply again in the future."


async def generate_approval_message(amount: float, emi: float, tenure_months: int) -> str:
    """
    Generate a congratulatory approval message using Gemini AI.

    Args:
        amount: Approved loan amount
        emi: Monthly EMI amount
        tenure_months: Loan tenure

    Returns:
        A congratulatory approval message
    """
    if not gemini_model:
        return f"Congratulations! Your loan of ₹{amount:,.2f} has been approved. Your monthly EMI will be ₹{emi:,.2f} for {tenure_months} months."

    try:
        prompt = f"""Generate a brief, congratulatory loan approval message.

        Loan Details:
        - Amount: ₹{amount:,.2f}
        - Monthly EMI: ₹{emi:,.2f}
        - Tenure: {tenure_months} months

        Requirements:
        - Be enthusiastic and professional
        - Keep it under 2 sentences
        - Mention the key numbers"""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        return f"Congratulations! Your loan of ₹{amount:,.2f} has been approved. Your monthly EMI will be ₹{emi:,.2f} for {tenure_months} months."


async def generate_bank_chat_response(
    user_name: str,
    loan_details: dict,
    user_query: str
) -> dict:
    """
    Generate an intelligent chat response as an AI Bank Manager using Gemini.

    Args:
        user_name: The user's full name
        loan_details: Dictionary with loan information (status, amount, emi, risk_score, etc.)
        user_query: The user's question/query

    Returns:
        Dictionary with 'response' and optional 'suggested_action'
    """
    if not gemini_model:
        return {
            "response": f"Hello {user_name}, I'm currently unable to process your request. Please try again later or contact our support team.",
            "suggested_action": "Contact customer support"
        }

    try:
        # Build context from loan details
        loan_status = loan_details.get("status", "No active application")
        amount = loan_details.get("amount", 0)
        emi = loan_details.get("emi", 0)
        risk_score = loan_details.get("risk_score", 0)
        
        context = f"""
Customer Name: {user_name}
Loan Status: {loan_status}
Loan Amount: ₹{amount:,.2f}
Monthly EMI: ₹{emi:,.2f}
Risk Score: {risk_score}/100
"""

        system_prompt = f"""You are a friendly and professional Bank Manager AI assistant for RISKOFF, a fintech company.
You have access to the customer's loan information.

CUSTOMER CONTEXT:
{context}

GUIDELINES:
- Be helpful, empathetic, and professional
- Answer questions based on the customer's actual loan data
- If the customer has no active loan, suggest they apply for one
- Keep responses concise (2-4 sentences)
- If asked about something you don't know, politely redirect to customer support
- Never reveal internal risk scores directly, use terms like "your profile looks strong" or "there are some concerns"
- Suggest logical next steps when appropriate

USER QUERY: {user_query}

Respond in a conversational manner. If there's a clear next action the user should take, mention it briefly."""

        response = gemini_model.generate_content(system_prompt)
        response_text = response.text.strip()
        
        # Determine if there's a suggested action based on context
        suggested_action = None
        if loan_status == "No active application":
            suggested_action = "Apply for a loan"
        elif loan_status == "PENDING":
            suggested_action = "Wait for approval notification"
        elif loan_status == "APPROVED":
            suggested_action = "Complete loan documentation"
        elif loan_status == "REJECTED":
            suggested_action = "Review rejection reasons and reapply"
        
        return {
            "response": response_text,
            "suggested_action": suggested_action
        }


    except Exception as e:
        return {
            "response": f"Hello {user_name}, I apologize but I'm having trouble processing your request right now. Please try again in a moment.",
            "suggested_action": "Try again or contact support"
        }


async def generate_financial_advice(summary: str) -> str:
    """
    Generate punchy, friendly financial advice based on a spending summary.
    """
    if not gemini_model:
        return "Keep an eye on your spending to improve your financial health!"

    try:
        prompt = f"""
        Analyze this user's spending summary: {summary}
        
        Give one short, punchy, friendly piece of financial advice (max 2 sentences).
        Address the user directly. Be encouraging.
        """
        response = gemini_model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error generating advice: {e}")
        return "Keep an eye on your spending to improve your financial health!"


async def extract_id_details(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Extract details from an ID card image using Gemini Vision AI.
    
    Supports: PAN Card, Aadhaar Card, Driver's License, Passport, Voter ID.
    
    Args:
        image_bytes: Raw image bytes of the ID card
        mime_type: MIME type of the image (default: image/jpeg)
        
    Returns:
        Dictionary with extracted fields:
        - full_name: Name on the ID card
        - date_of_birth: DOB in YYYY-MM-DD format
        - id_number: ID/document number
        - document_type: Type of ID (PAN, Aadhaar, Driver's License, etc.)
        - confidence: Extraction confidence (high/medium/low)
        
    Raises:
        ValueError: If extraction fails or image is unreadable
    """
    if not gemini_model:
        raise ValueError("Gemini AI model not initialized. Check GEMINI_API_KEY.")
    
    try:
        # Prepare image for Gemini Vision
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        # Structured prompt for ID extraction
        prompt = """Analyze this ID card image. Extract the following details in strict JSON format:
{
    "full_name": "Full name as printed on the ID",
    "date_of_birth": "YYYY-MM-DD",
    "id_number": "ID/Document number",
    "document_type": "PAN Card/Aadhaar Card/Driver's License/Passport/Voter ID/Other",
    "confidence": "high/medium/low"
}

Rules:
- Extract the name EXACTLY as printed on the ID card.
- For date_of_birth, convert to YYYY-MM-DD format. If only year is visible, use YYYY-01-01.
- For id_number, extract the primary identification number (PAN number, Aadhaar number, DL number, etc.)
- If a field is not visible or unreadable, use null.
- Set confidence based on image clarity: high (clearly readable), medium (partially readable), low (barely visible).
- Return ONLY the JSON object, no additional text."""
        
        # Generate response using Gemini Vision
        response = gemini_model.generate_content([prompt, image_part])
        
        if not response or not response.text:
            raise ValueError("Empty response from Gemini Vision")
        
        response_text = response.text.strip()
        
        # Clean up response if wrapped in code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        import json
        parsed_data = json.loads(response_text)
        
        # Validate and structure the response
        result = {
            "full_name": parsed_data.get("full_name"),
            "date_of_birth": parsed_data.get("date_of_birth"),
            "id_number": parsed_data.get("id_number"),
            "document_type": parsed_data.get("document_type", "Unknown"),
            "confidence": parsed_data.get("confidence", "medium")
        }
        
        return result
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Gemini response: {e}")
    except Exception as e:
        raise ValueError(f"Error extracting ID details: {e}")
