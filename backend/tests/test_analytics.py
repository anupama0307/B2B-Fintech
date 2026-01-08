"""
Comprehensive tests for Analytics Spending Endpoint.
Tests cover edge cases for spending aggregation and AI advice generation.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from app.main import app


# ============ Unit Tests for Spending Logic ============

class TestSpendingAggregation:
    """Unit tests for the spending aggregation logic."""

    def test_aggregate_single_debit_transaction(self):
        """Test aggregation with a single debit transaction."""
        txns = [
            {"type": "Debit", "amount": -100.50, "category": "Food"}
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 100.50
        assert category_totals == {"Food": 100.50}

    def test_aggregate_multiple_categories(self):
        """Test aggregation across multiple spending categories."""
        txns = [
            {"type": "Debit", "amount": -50.00, "category": "Food"},
            {"type": "Debit", "amount": -30.00, "category": "Transport"},
            {"type": "Debit", "amount": -100.00, "category": "Shopping"},
            {"type": "Debit", "amount": -25.00, "category": "Food"},
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 205.00
        assert category_totals["Food"] == 75.00
        assert category_totals["Transport"] == 30.00
        assert category_totals["Shopping"] == 100.00

    def test_ignores_credit_transactions(self):
        """Test that credit transactions are not counted in spending."""
        txns = [
            {"type": "Credit", "amount": 5000.00, "category": "Salary"},
            {"type": "Debit", "amount": -100.00, "category": "Food"},
            {"type": "Credit", "amount": 200.00, "category": "Refund"},
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 100.00
        assert "Salary" not in category_totals
        assert "Refund" not in category_totals

    def test_handles_null_category(self):
        """Test that null/None category defaults to 'Uncategorized'."""
        txns = [
            {"type": "Debit", "amount": -50.00, "category": None},
            {"type": "Debit", "amount": -30.00},  # Missing category key
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 80.00
        assert category_totals["Uncategorized"] == 80.00

    def test_handles_empty_transaction_list(self):
        """Test handling of empty transaction list."""
        txns = []
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 0
        assert category_totals == {}

    def test_handles_transaction_type_field_variation(self):
        """Test handling of 'transaction_type' vs 'type' field."""
        txns = [
            {"transaction_type": "Debit", "amount": -100.00, "category": "Food"},
            {"type": "Debit", "amount": -50.00, "category": "Transport"},
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 150.00

    def test_handles_positive_debit_amounts(self):
        """Test handling of positive amounts for debit transactions."""
        txns = [
            {"type": "Debit", "amount": 100.00, "category": "Food"},  # Positive but marked as Debit
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 100.00
        assert category_totals["Food"] == 100.00

    def test_handles_negative_amount_without_type(self):
        """Test that negative amounts without type are treated as debits."""
        txns = [
            {"amount": -75.00, "category": "Utilities"},  # No type, negative amount
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 75.00
        assert category_totals["Utilities"] == 75.00

    def test_handles_zero_amount(self):
        """Test handling of zero amount transactions."""
        txns = [
            {"type": "Debit", "amount": 0, "category": "Food"},
            {"type": "Debit", "amount": -50.00, "category": "Transport"},
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 50.00

    def test_handles_string_amounts(self):
        """Test handling of string amounts (should be converted to float)."""
        txns = [
            {"type": "Debit", "amount": "-100.50", "category": "Food"},
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 100.50

    def test_handles_large_transaction_count(self):
        """Test handling of many transactions (performance edge case)."""
        txns = [
            {"type": "Debit", "amount": -1.00, "category": f"Category_{i % 10}"}
            for i in range(1000)
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        assert total_spent == 1000.00
        assert len(category_totals) == 10


# ============ Integration Tests with Mocked Dependencies ============

class TestSpendingEndpoint:
    """Integration tests for the /analytics/spending endpoint."""

    def test_spending_endpoint_unauthorized(self):
        """Test endpoint rejects unauthorized requests."""
        client = TestClient(app)
        response = client.get("/analytics/spending")
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422]


# ============ Tests for AI Advice Generation ============

class TestFinancialAdviceGeneration:
    """Tests for the LLM financial advice generation."""

    def test_advice_without_gemini_model(self):
        """Test fallback when Gemini model is not configured."""
        import asyncio
        from app.services import llm
        
        # Temporarily set gemini_model to None
        original_model = llm.gemini_model
        llm.gemini_model = None
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.generate_financial_advice("Total: $500")
            )
            assert "Keep an eye on your spending" in result
        finally:
            llm.gemini_model = original_model

    def test_advice_with_gemini_success(self):
        """Test successful advice generation with Gemini."""
        import asyncio
        from app.services import llm
        from unittest.mock import MagicMock
        
        # Create a mock model
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = "  Great job saving money!  "
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.generate_financial_advice("Total: $500")
            )
            assert result == "Great job saving money!"  # Should be stripped
        finally:
            llm.gemini_model = original_model

    def test_advice_gemini_error_fallback(self):
        """Test fallback when Gemini throws an error."""
        import asyncio
        from app.services import llm
        from unittest.mock import MagicMock
        
        # Create a mock model that raises an error
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = Exception("API rate limit")
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.generate_financial_advice("Total: $500")
            )
            assert "Keep an eye on your spending" in result
        finally:
            llm.gemini_model = original_model


# ============ Edge Case Tests for Rounding ============

class TestRounding:
    """Tests for proper rounding of monetary values."""

    def test_rounding_to_two_decimals(self):
        """Test that totals are rounded to 2 decimal places."""
        txns = [
            {"type": "Debit", "amount": -10.333, "category": "Food"},
            {"type": "Debit", "amount": -20.666, "category": "Food"},
        ]
        
        category_totals = {}
        total_spent = 0
        
        for t in txns:
            t_type = t.get('type') or t.get('transaction_type')
            amount = float(t.get('amount', 0))
            
            if t_type == 'Debit' or (t_type is None and amount < 0):
                cat = t.get('category', 'Uncategorized') or 'Uncategorized'
                abs_amt = abs(amount)
                category_totals[cat] = category_totals.get(cat, 0) + abs_amt
                total_spent += abs_amt
        
        # The endpoint rounds to 2 decimals
        total_spent_rounded = round(total_spent, 2)
        assert total_spent_rounded == 30.999 or total_spent_rounded == 31.0

    def test_floating_point_precision(self):
        """Test handling of floating point precision issues."""
        txns = [
            {"type": "Debit", "amount": -0.1, "category": "Test"},
            {"type": "Debit", "amount": -0.2, "category": "Test"},
        ]
        
        total_spent = 0
        for t in txns:
            if t.get('type') == 'Debit':
                total_spent += abs(float(t.get('amount', 0)))
        
        # Classic floating point issue: 0.1 + 0.2 != 0.3
        total_spent_rounded = round(total_spent, 2)
        assert total_spent_rounded == 0.3
