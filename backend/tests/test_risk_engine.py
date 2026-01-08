"""
Unit tests for Risk Engine.
Tests stability, edge cases, and core logic.
"""

import pytest
from app.services.risk_engine import calculate_risk_score

def test_risk_engine_valid_low_risk():
    """Test a clear low-risk (APPROVED) case."""
    result = calculate_risk_score(
        amount=5000,
        tenure_months=12,
        income=50000,
        expenses=10000
    )
    assert result["status"] == "APPROVED"
    assert result["score"] <= 50

def test_risk_engine_valid_high_risk():
    """Test a clear high-risk (REJECTED) case - high DTI."""
    result = calculate_risk_score(
        amount=100000,
        tenure_months=12,
        income=5000,
        expenses=4000
    )
    assert result["status"] == "REJECTED"
    assert result["score"] > 50

def test_risk_engine_zero_income():
    """
    STABILITY TEST: Ensure zero division errors are handled.
    """
    result = calculate_risk_score(
        amount=5000,
        tenure_months=12,
        income=0,
        expenses=1000
    )
    # Should not crash, should return REJECTED
    assert result["status"] == "REJECTED"
    assert result["score"] == 100.0

def test_risk_engine_negative_values():
    """
    STABILITY TEST: Logic should handle negative values gracefully 
    (though API layer should block them, engine shouldn't crash).
    """
    result = calculate_risk_score(
        amount=-5000,
        tenure_months=12,
        income=50000,
        expenses=10000
    )
    # The math might produce weird scores, but it shouldn't raise exception
    assert isinstance(result["score"], float)

def test_risk_engine_extreme_values():
    """
    STABILITY TEST: Very large loan amounts should not crash.
    The system should return a valid result without exceptions.
    """
    result = calculate_risk_score(
        amount=1_000_000_000,
        tenure_months=12,
        income=50000,
        expenses=10000
    )
    # Should return a valid dict without crashing
    assert isinstance(result, dict)
    assert "score" in result
    assert "status" in result
