"""
Investments router for RISKOFF API.
Provides mock investment data based on Setu Account Aggregator FI data types.
Reference: https://docs.setu.co/data/account-aggregator/fi-data-types
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional, List, Dict, Any
from app.utils.security import get_current_user, CurrentUser

router = APIRouter(
    prefix="/investments",
    tags=["Investments"]
)

# ========== MOCK DATA (Based on Setu AA FI Types) ==========

MOCK_PORTFOLIO = {
    "total_invested": 850000,
    "current_value": 1025000,
    "total_gain": 175000,
    "gain_percentage": 20.59,
    "last_updated": "2026-01-12T18:00:00+05:30"
}

MOCK_DEPOSITS = [
    {
        "type": "TERM_DEPOSIT",
        "bank_name": "HDFC Bank",
        "account_number_masked": "XXXXXXX4521",
        "principal_amount": 200000,
        "current_value": 219845.90,
        "interest_rate": 7.5,
        "maturity_date": "2026-08-15",
        "opening_date": "2024-08-15",
        "tenure_months": 24,
        "status": "ACTIVE"
    },
    {
        "type": "RECURRING_DEPOSIT",
        "bank_name": "SBI",
        "account_number_masked": "XXXXXXX8732",
        "principal_amount": 60000,
        "current_value": 63500,
        "interest_rate": 6.8,
        "monthly_amount": 5000,
        "maturity_date": "2026-12-01",
        "opening_date": "2025-12-01",
        "tenure_months": 12,
        "status": "ACTIVE"
    }
]

MOCK_MUTUAL_FUNDS = [
    {
        "scheme_name": "Axis Bluechip Fund - Direct Growth",
        "amc": "Axis Mutual Fund",
        "folio_number": "1029384756",
        "isin": "INF846K01DP8",
        "units": 245.67,
        "nav": 52.34,
        "invested_value": 100000,
        "current_value": 128560,
        "returns_percentage": 28.56,
        "scheme_type": "EQUITY",
        "mode": "SIP"
    },
    {
        "scheme_name": "ICICI Prudential Technology Fund",
        "amc": "ICICI Prudential",
        "folio_number": "8374629501",
        "isin": "INF109K01Z48",
        "units": 156.89,
        "nav": 178.45,
        "invested_value": 200000,
        "current_value": 280000,
        "returns_percentage": 40.0,
        "scheme_type": "EQUITY",
        "mode": "LUMPSUM"
    },
    {
        "scheme_name": "HDFC Corporate Bond Fund",
        "amc": "HDFC Mutual Fund",
        "folio_number": "5647382910",
        "isin": "INF179K01BB0",
        "units": 4521.23,
        "nav": 28.76,
        "invested_value": 100000,
        "current_value": 130030,
        "returns_percentage": 30.03,
        "scheme_type": "DEBT",
        "mode": "SIP"
    }
]

MOCK_STOCKS = [
    {
        "symbol": "RELIANCE",
        "company_name": "Reliance Industries Ltd",
        "exchange": "NSE",
        "quantity": 15,
        "avg_buy_price": 2450.50,
        "current_price": 2890.75,
        "invested_value": 36757.50,
        "current_value": 43361.25,
        "returns_percentage": 17.96,
        "isin": "INE002A01018"
    },
    {
        "symbol": "TCS",
        "company_name": "Tata Consultancy Services",
        "exchange": "NSE",
        "quantity": 20,
        "avg_buy_price": 3200.00,
        "current_price": 3650.40,
        "invested_value": 64000,
        "current_value": 73008,
        "returns_percentage": 14.08,
        "isin": "INE467B01029"
    },
    {
        "symbol": "INFY",
        "company_name": "Infosys Limited",
        "exchange": "NSE",
        "quantity": 30,
        "avg_buy_price": 1450.00,
        "current_price": 1780.25,
        "invested_value": 43500,
        "current_value": 53407.50,
        "returns_percentage": 22.77,
        "isin": "INE009A01021"
    }
]

MOCK_INSURANCE = [
    {
        "policy_type": "LIFE",
        "policy_name": "LIC Jeevan Anand",
        "policy_number": "LICJA20210045",
        "sum_assured": 2500000,
        "premium_amount": 45000,
        "premium_frequency": "YEARLY",
        "start_date": "2021-03-15",
        "maturity_date": "2041-03-15",
        "tenure_years": 20,
        "status": "ACTIVE",
        "nominee": "Spouse"
    },
    {
        "policy_type": "HEALTH",
        "policy_name": "HDFC ERGO Health Suraksha",
        "policy_number": "HDFC2024H789",
        "sum_assured": 1000000,
        "premium_amount": 18500,
        "premium_frequency": "YEARLY",
        "start_date": "2024-01-01",
        "maturity_date": "2025-01-01",
        "tenure_years": 1,
        "status": "ACTIVE",
        "covers": ["Hospitalization", "Day Care", "Pre/Post Hospitalization"]
    }
]

MOCK_PENSION = {
    "epf": {
        "uan": "1001234567890",
        "establishment": "Tech Solutions Pvt Ltd",
        "employee_balance": 450000,
        "employer_balance": 520000,
        "total_balance": 970000,
        "opening_date": "2019-06-01",
        "status": "ACTIVE"
    },
    "ppf": {
        "account_number": "XXXXXXX5678",
        "bank": "SBI",
        "current_balance": 185000,
        "interest_rate": 7.1,
        "maturity_date": "2034-04-01",
        "opening_date": "2019-04-01",
        "status": "ACTIVE"
    },
    "nps": {
        "pran": "1102345678901",
        "tier1_value": 280000,
        "tier2_value": 45000,
        "equity_allocation": 75,
        "debt_allocation": 25,
        "current_value": 325000,
        "status": "ACTIVE"
    }
}

MOCK_TRANSACTIONS = {
    "total_credit": 125000,
    "total_debit": 87500,
    "upi_transactions": 62,
    "upi_amount": 45600,
    "non_upi_amount": 41900,
    "categories": {
        "groceries": 12500,
        "utilities": 8500,
        "entertainment": 6500,
        "food_dining": 15000,
        "shopping": 22000,
        "travel": 8500,
        "others": 14500
    }
}

# ========== ENDPOINTS ==========

@router.get("/portfolio")
async def get_portfolio_summary(current_user: CurrentUser = Depends(get_current_user)):
    """Get overall portfolio summary with asset allocation."""
    
    # Calculate asset allocation
    mf_value = sum(mf["current_value"] for mf in MOCK_MUTUAL_FUNDS)
    stock_value = sum(s["current_value"] for s in MOCK_STOCKS)
    deposit_value = sum(d["current_value"] for d in MOCK_DEPOSITS)
    pension_value = MOCK_PENSION["epf"]["total_balance"] + MOCK_PENSION["ppf"]["current_balance"] + MOCK_PENSION["nps"]["current_value"]
    
    total = mf_value + stock_value + deposit_value + pension_value
    
    return {
        "summary": MOCK_PORTFOLIO,
        "allocation": [
            {"name": "Mutual Funds", "value": mf_value, "percentage": round(mf_value/total*100, 1)},
            {"name": "Stocks", "value": stock_value, "percentage": round(stock_value/total*100, 1)},
            {"name": "Deposits", "value": deposit_value, "percentage": round(deposit_value/total*100, 1)},
            {"name": "Pension", "value": pension_value, "percentage": round(pension_value/total*100, 1)}
        ],
        "total_value": total
    }


@router.get("/deposits")
async def get_deposits(current_user: CurrentUser = Depends(get_current_user)):
    """Get all deposit accounts (FD, RD, CD)."""
    total_invested = sum(d["principal_amount"] for d in MOCK_DEPOSITS)
    total_current = sum(d["current_value"] for d in MOCK_DEPOSITS)
    
    return {
        "deposits": MOCK_DEPOSITS,
        "summary": {
            "total_invested": total_invested,
            "current_value": total_current,
            "total_interest": total_current - total_invested
        }
    }


@router.get("/mutual-funds")
async def get_mutual_funds(current_user: CurrentUser = Depends(get_current_user)):
    """Get mutual fund holdings."""
    total_invested = sum(mf["invested_value"] for mf in MOCK_MUTUAL_FUNDS)
    total_current = sum(mf["current_value"] for mf in MOCK_MUTUAL_FUNDS)
    
    return {
        "holdings": MOCK_MUTUAL_FUNDS,
        "summary": {
            "total_invested": total_invested,
            "current_value": total_current,
            "total_gain": total_current - total_invested,
            "overall_returns": round((total_current - total_invested) / total_invested * 100, 2)
        }
    }


@router.get("/stocks")
async def get_stocks(current_user: CurrentUser = Depends(get_current_user)):
    """Get stock/equity holdings."""
    total_invested = sum(s["invested_value"] for s in MOCK_STOCKS)
    total_current = sum(s["current_value"] for s in MOCK_STOCKS)
    
    return {
        "holdings": MOCK_STOCKS,
        "summary": {
            "total_invested": total_invested,
            "current_value": total_current,
            "total_gain": total_current - total_invested,
            "overall_returns": round((total_current - total_invested) / total_invested * 100, 2)
        }
    }


@router.get("/insurance")
async def get_insurance(current_user: CurrentUser = Depends(get_current_user)):
    """Get insurance policies."""
    total_premium = sum(p["premium_amount"] for p in MOCK_INSURANCE)
    total_cover = sum(p["sum_assured"] for p in MOCK_INSURANCE)
    
    return {
        "policies": MOCK_INSURANCE,
        "summary": {
            "total_policies": len(MOCK_INSURANCE),
            "total_annual_premium": total_premium,
            "total_coverage": total_cover
        }
    }


@router.get("/pension")
async def get_pension(current_user: CurrentUser = Depends(get_current_user)):
    """Get pension fund details (EPF, PPF, NPS)."""
    total = (
        MOCK_PENSION["epf"]["total_balance"] + 
        MOCK_PENSION["ppf"]["current_balance"] + 
        MOCK_PENSION["nps"]["current_value"]
    )
    
    return {
        "epf": MOCK_PENSION["epf"],
        "ppf": MOCK_PENSION["ppf"],
        "nps": MOCK_PENSION["nps"],
        "total_pension_value": total
    }


@router.get("/transactions/analytics")
async def get_transaction_analytics(current_user: CurrentUser = Depends(get_current_user)):
    """Get transaction analytics for visualization."""
    return {
        "analytics": MOCK_TRANSACTIONS,
        "upi_vs_non_upi": [
            {"name": "UPI", "value": MOCK_TRANSACTIONS["upi_amount"]},
            {"name": "Non-UPI", "value": MOCK_TRANSACTIONS["non_upi_amount"]}
        ],
        "credit_vs_debit": [
            {"name": "Credit", "value": MOCK_TRANSACTIONS["total_credit"]},
            {"name": "Debit", "value": MOCK_TRANSACTIONS["total_debit"]}
        ],
        "category_breakdown": [
            {"name": k.replace("_", " ").title(), "value": v} 
            for k, v in MOCK_TRANSACTIONS["categories"].items()
        ]
    }


@router.get("/maturity-calendar")
async def get_maturity_calendar(current_user: CurrentUser = Depends(get_current_user)):
    """Get upcoming maturity dates for all investments."""
    maturities = []
    
    # Add deposits
    for d in MOCK_DEPOSITS:
        maturities.append({
            "type": d["type"].replace("_", " ").title(),
            "name": f"{d['bank_name']} {d['type'].replace('_', ' ').title()}",
            "maturity_date": d["maturity_date"],
            "maturity_amount": d["current_value"]
        })
    
    # Add insurance
    for p in MOCK_INSURANCE:
        if p["policy_type"] == "LIFE":
            maturities.append({
                "type": "Insurance",
                "name": p["policy_name"],
                "maturity_date": p["maturity_date"],
                "maturity_amount": p["sum_assured"]
            })
    
    # Add PPF
    maturities.append({
        "type": "PPF",
        "name": "Public Provident Fund",
        "maturity_date": MOCK_PENSION["ppf"]["maturity_date"],
        "maturity_amount": MOCK_PENSION["ppf"]["current_balance"] * 1.5  # Estimated
    })
    
    # Sort by date
    maturities.sort(key=lambda x: x["maturity_date"])
    
    return {"maturities": maturities}
