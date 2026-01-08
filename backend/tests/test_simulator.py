"""
Integration tests for Simulator Endpoint.
"""

from fastapi.testclient import TestClient

def test_simulator_valid_request(client: TestClient):
    """Test valid simulation request."""
    payload = {
        "amount": 5000,
        "tenure_months": 12,
        "income": 50000,
        "expenses": 10000
    }
    response = client.post("/simulator/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "status" in data
    assert data["status"] == "LOW"

def test_simulator_invalid_input(client: TestClient):
    """Test input validation (negative numbers)."""
    payload = {
        "amount": -5000,
        "tenure_months": 12,
        "income": 50000,
        "expenses": 10000
    }
    response = client.post("/simulator/calculate", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_simulator_zero_amount(client: TestClient):
    """Test input validation (zero amount)."""
    payload = {
        "amount": 0,
        "tenure_months": 12,
        "income": 50000,
        "expenses": 10000
    }
    response = client.post("/simulator/calculate", json=payload)
    assert response.status_code == 400

def test_simulator_missing_field(client: TestClient):
    """Test default validation error."""
    payload = {
        "amount": 5000,
        "income": 50000
        # Missing tenure and expenses
    }
    response = client.post("/simulator/calculate", json=payload)
    assert response.status_code == 422
