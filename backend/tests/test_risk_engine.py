"""
Unit tests for Risk Engine.
Tests stability, edge cases, and core logic.
"""

import pytest
from app.services.risk_engine import calculate_risk_score

def test_risk_engine_valid_low_risk():
    """Test a clear low-risk case."""
    result = calculate_risk_score(
        amount=5000,
        tenure_months=12,
        income=50000,
        expenses=10000
    )
    assert result.status == "LOW"
    assert result.score >= 70

def test_risk_engine_valid_high_risk():
    """Test a clear high-risk case (high DTI)."""
    result = calculate_risk_score(
        amount=100000,
        tenure_months=12,
        income=5000,
        expenses=4000
    )
    assert result.status == "HIGH"
    assert result.score < 40

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
    # Should not crash, should return HIGH risk
    assert result.status == "HIGH"
    assert result.score < 40

def test_risk_engine_negative_values():
    """
    STABILITY TEST: Logic should handle negative values gracefully 
    (though API layer should block them, engine shoudln't crash).
    """
    result = calculate_risk_score(
        amount=-5000,
        tenure_months=12,
        income=50000,
        expenses=10000
    )
    # The math might produce weird scores, but it shouldn't raise exception
    assert isinstance(result.score, float)

def test_risk_engine_extreme_values():
    """
    STABILITY TEST: Very large numbers.
    """
    result = calculate_risk_score(
        amount=1_000_000_000,
        tenure_months=12,
        income=50000,
        expenses=10000
    )
    assert result.status == "HIGH" 
