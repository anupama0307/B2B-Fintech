"""
Loans router for RISKOFF API.
Handles loan applications and risk assessment with authentication.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.config import supabase_client
from app.schemas import LoanCreate, LoanResponse, LoanApplication, RiskResult
from app.services.risk_engine import calculate_risk_score
from app.services import audit
from app.services.llm import generate_rejection_reason, generate_approval_message
from app.utils.security import get_current_user, CurrentUser

router = APIRouter(
    prefix="/loans",
    tags=["Loans"]
)


@router.post("/apply", response_model=LoanResponse)
async def apply_for_loan(
    application: LoanCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Submit a loan application and get instant risk assessment.
    
    Requires authentication. Calculates risk, generates AI explanation,
    saves to database, and logs the action.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    try:
        # Calculate risk score using the new engine
        risk_result = calculate_risk_score(
            amount=application.amount,
            tenure_months=application.tenure_months,
            income=application.monthly_income,
            expenses=application.monthly_expenses
        )

        # Generate AI explanation based on status
        if risk_result["status"] == "REJECTED":
            ai_explanation = await generate_rejection_reason(risk_result["reasons"])
        else:
            ai_explanation = await generate_approval_message(
                amount=application.amount,
                emi=risk_result["emi"],
                tenure_months=application.tenure_months
            )

        # Prepare loan data for database
        loan_data = {
            "user_id": current_user.id,
            "amount": application.amount,
            "tenure_months": application.tenure_months,
            "interest_rate": 12.0,
            "emi": risk_result["emi"],
            "status": risk_result["status"],
            "risk_score": risk_result["score"],
            "risk_reason": ", ".join(risk_result["reasons"]),
            "ai_explanation": ai_explanation
        }

        # Store loan application in Supabase
        response = supabase_client.table("loans").insert(loan_data).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save loan application"
            )

        loan_record = response.data[0]

        # Log the action (non-blocking, won't crash on failure)
        await audit.log_action(
            user_id=current_user.id,
            action="LOAN_APPLICATION",
            details={
                "loan_id": loan_record.get("id"),
                "amount": application.amount,
                "status": risk_result["status"],
                "risk_score": risk_result["score"],
                "purpose": application.purpose
            }
        )

        # Calculate max approved amount (only if approved)
        max_approved = application.amount if risk_result["status"] == "APPROVED" else None

        return LoanResponse(
            id=loan_record.get("id"),
            status=risk_result["status"],
            risk_score=risk_result["score"],
            max_approved_amount=max_approved,
            emi=risk_result["emi"],
            ai_explanation=ai_explanation
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/my-loans")
async def get_my_loans(current_user: CurrentUser = Depends(get_current_user)):
    """
    Get all loan applications for the authenticated user.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    try:
        response = supabase_client.table("loans").select("*").eq(
            "user_id", current_user.id
        ).order("created_at", desc=True).execute()

        return {"loans": response.data, "total": len(response.data)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/")
async def get_all_loans():
    """
    Get all loan applications (admin view).
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    try:
        response = supabase_client.table("loans").select("*").execute()
        return {"loans": response.data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{loan_id}")
async def get_loan_by_id(loan_id: str):
    """
    Get a specific loan by ID.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase client not initialized"
        )

    try:
        response = supabase_client.table("loans").select("*").eq("id", loan_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{loan_id}/schedule")
async def get_loan_schedule(
    loan_id: str,
    format: str = "json",
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get the loan amortization schedule with monthly payment breakdown.
    
    Query Params:
        - format: 'json' (default) or 'pdf'
    
    Returns:
        - JSON: Monthly breakdown with principal, interest, and remaining balance
        - PDF: Downloadable amortization schedule document
    
    Requires authentication. User must own the loan.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )

    try:
        # Fetch the loan
        response = supabase_client.table("loans").select("*").eq("id", loan_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )

        loan = response.data[0]

        # Verify ownership
        if loan.get("user_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this loan"
            )

        # Check if loan is approved
        if loan.get("status") != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Schedule only available for approved loans. Current status: {loan.get('status')}"
            )

        # Extract loan details
        loan_amount = float(loan.get("amount", 0))
        tenure_months = int(loan.get("tenure_months", 12))
        annual_rate = float(loan.get("interest_rate", 12.0))
        emi = float(loan.get("emi", 0))

        # Calculate monthly interest rate
        monthly_rate = annual_rate / 100 / 12

        # Generate amortization schedule
        balance = loan_amount
        schedule = []

        for month in range(1, tenure_months + 1):
            interest_payment = balance * monthly_rate
            principal_payment = emi - interest_payment
            balance = max(0, balance - principal_payment)

            schedule.append({
                "month": month,
                "emi": round(emi, 2),
                "principal": round(principal_payment, 2),
                "interest": round(interest_payment, 2),
                "balance": round(balance, 2)
            })

        # Calculate totals
        total_payment = emi * tenure_months
        total_interest = total_payment - loan_amount

        schedule_data = {
            "loan_id": loan_id,
            "loan_amount": loan_amount,
            "tenure_months": tenure_months,
            "interest_rate": annual_rate,
            "emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "schedule": schedule
        }

        # Return JSON or PDF
        if format.lower() == "pdf":
            return generate_schedule_pdf(schedule_data, current_user.full_name or "Customer")
        else:
            return schedule_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating schedule: {str(e)}"
        )


def generate_schedule_pdf(schedule_data: dict, customer_name: str):
    """
    Generate a professional PDF amortization schedule.
    """
    from fastapi.responses import StreamingResponse
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from io import BytesIO
    from datetime import datetime

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=1,  # Center
        spaceAfter=20,
        textColor=colors.HexColor('#1a365d')
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        alignment=1,
        spaceAfter=10,
        textColor=colors.gray
    )

    # Title
    elements.append(Paragraph("RISKOFF FINTECH", title_style))
    elements.append(Paragraph("Loan Amortization Schedule", subtitle_style))
    elements.append(Spacer(1, 20))

    # Loan Summary
    summary_data = [
        ["Customer Name:", customer_name, "Loan ID:", schedule_data["loan_id"][:8] + "..."],
        ["Loan Amount:", f"₹{schedule_data['loan_amount']:,.2f}", "Interest Rate:", f"{schedule_data['interest_rate']}% p.a."],
        ["Tenure:", f"{schedule_data['tenure_months']} months", "Monthly EMI:", f"₹{schedule_data['emi']:,.2f}"],
        ["Total Payment:", f"₹{schedule_data['total_payment']:,.2f}", "Total Interest:", f"₹{schedule_data['total_interest']:,.2f}"],
    ]

    summary_table = Table(summary_data, colWidths=[1.5*inch, 1.8*inch, 1.3*inch, 1.8*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#2c5282')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 30))

    # Schedule Header
    elements.append(Paragraph("Monthly Payment Schedule", styles['Heading2']))
    elements.append(Spacer(1, 10))

    # Schedule Table
    table_data = [["Month", "EMI (₹)", "Principal (₹)", "Interest (₹)", "Balance (₹)"]]

    for entry in schedule_data["schedule"]:
        table_data.append([
            str(entry["month"]),
            f"{entry['emi']:,.2f}",
            f"{entry['principal']:,.2f}",
            f"{entry['interest']:,.2f}",
            f"{entry['balance']:,.2f}"
        ])

    schedule_table = Table(table_data, colWidths=[0.8*inch, 1.3*inch, 1.3*inch, 1.3*inch, 1.5*inch])
    schedule_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        # Body
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        # Alternating rows
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#edf2f7')]),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
    ]))
    elements.append(schedule_table)
    elements.append(Spacer(1, 30))

    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        alignment=1,
        textColor=colors.gray
    )
    elements.append(Paragraph(
        f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')} | RISKOFF Fintech Pvt. Ltd.",
        footer_style
    ))
    elements.append(Paragraph(
        "This is a computer-generated document and does not require a signature.",
        footer_style
    ))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=loan_schedule_{schedule_data['loan_id'][:8]}.pdf"
        }
    )
