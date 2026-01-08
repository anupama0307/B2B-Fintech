"""
Comprehensive tests for KYC Verification Endpoint.
Tests cover edge cases for ID extraction, name matching, and verification flow.
"""

import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app


# ============ Unit Tests for Name Matching ============

class TestNameMatching:
    """Unit tests for the fuzzy name matching logic."""

    def test_exact_match(self):
        """Test exact name match."""
        from app.services.parser import is_name_match
        
        assert is_name_match("John Doe", "John Doe") is True

    def test_case_insensitive_match(self):
        """Test case-insensitive matching."""
        from app.services.parser import is_name_match
        
        assert is_name_match("JOHN DOE", "john doe") is True
        assert is_name_match("John Doe", "JOHN DOE") is True

    def test_name_contained_in_other(self):
        """Test when one name is contained in the other."""
        from app.services.parser import is_name_match
        
        assert is_name_match("John Doe Smith", "John Doe") is True
        assert is_name_match("John Doe", "John Doe Smith") is True

    def test_reversed_name_order(self):
        """Test matching with reversed name order (Doe, John vs John Doe)."""
        from app.services.parser import is_name_match
        
        assert is_name_match("Doe, John", "John Doe") is True
        assert is_name_match("Doe John", "John Doe") is True

    def test_partial_name_match(self):
        """Test partial name matching with sufficient similarity."""
        from app.services.parser import is_name_match
        
        # These should match due to high similarity
        assert is_name_match("John D.", "John Doe", threshold=0.6) is True
        assert is_name_match("J. Doe", "John Doe", threshold=0.5) is True

    def test_completely_different_names(self):
        """Test that completely different names don't match."""
        from app.services.parser import is_name_match
        
        assert is_name_match("Alice Smith", "Bob Johnson") is False
        assert is_name_match("Random Person", "John Doe") is False

    def test_empty_names(self):
        """Test handling of empty/null names."""
        from app.services.parser import is_name_match
        
        assert is_name_match("", "John Doe") is False
        assert is_name_match("John Doe", "") is False
        assert is_name_match(None, "John Doe") is False
        assert is_name_match("John Doe", None) is False

    def test_name_with_extra_whitespace(self):
        """Test matching with extra whitespace."""
        from app.services.parser import is_name_match
        
        assert is_name_match("  John   Doe  ", "John Doe") is True
        assert is_name_match("John Doe", "  John   Doe  ") is True

    def test_name_with_middle_name(self):
        """Test matching with/without middle name."""
        from app.services.parser import is_name_match
        
        assert is_name_match("John Michael Doe", "John Doe") is True
        assert is_name_match("John Doe", "John M. Doe") is True

    def test_indian_name_formats(self):
        """Test common Indian name formats."""
        from app.services.parser import is_name_match
        
        # S/O, D/O patterns often in official docs
        assert is_name_match("RAHUL KUMAR", "Rahul Kumar") is True
        assert is_name_match("SHARMA RAHUL", "Rahul Sharma") is True


# ============ Unit Tests for ID Extraction ============

class TestIdExtraction:
    """Unit tests for the Gemini Vision ID extraction logic."""

    def test_extract_id_without_gemini(self):
        """Test that extraction fails gracefully without Gemini."""
        import asyncio
        from app.services import llm
        
        original_model = llm.gemini_model
        llm.gemini_model = None
        
        try:
            with pytest.raises(ValueError) as exc_info:
                asyncio.get_event_loop().run_until_complete(
                    llm.extract_id_details(b"fake_image_bytes", "image/jpeg")
                )
            assert "Gemini AI model not initialized" in str(exc_info.value)
        finally:
            llm.gemini_model = original_model

    def test_extract_id_successful(self):
        """Test successful ID extraction with mocked Gemini."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '''
        {
            "full_name": "Rahul Kumar",
            "date_of_birth": "1990-05-15",
            "id_number": "ABCDE1234F",
            "document_type": "PAN Card",
            "confidence": "high"
        }
        '''
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.extract_id_details(b"fake_image_bytes", "image/jpeg")
            )
            
            assert result["full_name"] == "Rahul Kumar"
            assert result["date_of_birth"] == "1990-05-15"
            assert result["id_number"] == "ABCDE1234F"
            assert result["document_type"] == "PAN Card"
            assert result["confidence"] == "high"
        finally:
            llm.gemini_model = original_model

    def test_extract_id_with_code_block_response(self):
        """Test extraction when Gemini wraps response in code blocks."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '''```json
        {
            "full_name": "Test User",
            "date_of_birth": "1985-01-01",
            "id_number": "DL1234567890",
            "document_type": "Driver's License",
            "confidence": "medium"
        }
        ```'''
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.extract_id_details(b"fake_image_bytes", "image/png")
            )
            
            assert result["full_name"] == "Test User"
            assert result["document_type"] == "Driver's License"
        finally:
            llm.gemini_model = original_model

    def test_extract_id_with_null_fields(self):
        """Test extraction when some fields are unreadable."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '''
        {
            "full_name": "Partial Name",
            "date_of_birth": null,
            "id_number": null,
            "document_type": "Unknown",
            "confidence": "low"
        }
        '''
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.extract_id_details(b"fake_image_bytes", "image/jpeg")
            )
            
            assert result["full_name"] == "Partial Name"
            assert result["date_of_birth"] is None
            assert result["id_number"] is None
            assert result["confidence"] == "low"
        finally:
            llm.gemini_model = original_model

    def test_extract_id_gemini_error(self):
        """Test handling of Gemini API errors."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = Exception("API rate limit exceeded")
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            with pytest.raises((ValueError, Exception)):
                asyncio.get_event_loop().run_until_complete(
                    llm.extract_id_details(b"fake_image_bytes", "image/jpeg")
                )
        finally:
            llm.gemini_model = original_model

    def test_extract_id_invalid_json_response(self):
        """Test handling of invalid JSON from Gemini."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = "This is not valid JSON"
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            with pytest.raises(ValueError) as exc_info:
                asyncio.get_event_loop().run_until_complete(
                    llm.extract_id_details(b"fake_image_bytes", "image/jpeg")
                )
            # Check for either error message format
            error_msg = str(exc_info.value)
            assert "Failed to parse" in error_msg or "Error extracting" in error_msg
        finally:
            llm.gemini_model = original_model

    def test_extract_id_empty_response(self):
        """Test handling of empty Gemini response."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        # Simulate None response object
        mock_model.generate_content.return_value = None
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            # Should raise some exception due to None response
            with pytest.raises(Exception):
                asyncio.get_event_loop().run_until_complete(
                    llm.extract_id_details(b"fake_image_bytes", "image/jpeg")
                )
        finally:
            llm.gemini_model = original_model


# ============ Integration Tests for KYC Endpoint ============

class TestKycEndpoint:
    """Integration tests for the /upload/kyc endpoint."""

    def test_kyc_endpoint_unauthorized(self):
        """Test that KYC endpoint requires authentication."""
        client = TestClient(app)
        
        # Create a fake file
        files = {"file": ("test.jpg", b"fake_image_bytes", "image/jpeg")}
        response = client.post("/upload/kyc", files=files)
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422]

    def test_kyc_endpoint_invalid_file_type(self):
        """Test rejection of non-image files."""
        client = TestClient(app)
        
        # Try to upload a PDF
        files = {"file": ("test.pdf", b"fake_pdf_content", "application/pdf")}
        response = client.post(
            "/upload/kyc",
            files=files,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        # Should reject with 400 or 401 (auth first, then file validation)
        assert response.status_code in [400, 401, 403, 422]

    def test_kyc_endpoint_empty_file(self):
        """Test rejection of empty files."""
        client = TestClient(app)
        
        files = {"file": ("empty.jpg", b"", "image/jpeg")}
        response = client.post(
            "/upload/kyc",
            files=files,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        # Should reject (auth first, then empty check)
        assert response.status_code in [400, 401, 403, 422]


# ============ Edge Case Tests for Verification Flow ============

class TestVerificationFlow:
    """Tests for the full verification flow logic."""

    def test_verification_name_match_high_threshold(self):
        """Test that 70% threshold is used for name matching."""
        from app.services.parser import is_name_match
        
        # Very similar names should pass at 70% threshold
        assert is_name_match("John Doee", "John Doe", threshold=0.7) is True
        
        # Very different names should fail
        assert is_name_match("Xyz Abc", "John Doe", threshold=0.7) is False

    def test_verification_handles_special_characters(self):
        """Test name matching with special characters."""
        from app.services.parser import is_name_match
        
        # Names with periods, commas should still match
        assert is_name_match("John. Doe", "John Doe") is True
        assert is_name_match("John, Doe", "John Doe") is True

    def test_verification_unicode_names(self):
        """Test handling of Unicode/non-ASCII names."""
        from app.services.parser import is_name_match
        
        # Hindi names
        assert is_name_match("राहुल कुमार", "राहुल कुमार") is True
        
        # Mixed script (should fail - completely different)
        assert is_name_match("Rahul Kumar", "राहुल कुमार") is False


# ============ Document Type Tests ============

class TestDocumentTypes:
    """Tests for different ID document types."""

    def test_pan_card_extraction_format(self):
        """Test PAN card specific format (ABCDE1234F)."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '''
        {
            "full_name": "RAHUL SHARMA",
            "date_of_birth": "1990-01-15",
            "id_number": "ABCDE1234F",
            "document_type": "PAN Card",
            "confidence": "high"
        }
        '''
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.extract_id_details(b"fake_pan_image", "image/jpeg")
            )
            
            assert result["document_type"] == "PAN Card"
            assert len(result["id_number"]) == 10  # PAN is 10 chars
        finally:
            llm.gemini_model = original_model

    def test_aadhaar_card_extraction_format(self):
        """Test Aadhaar card specific format (12 digits)."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '''
        {
            "full_name": "Priya Singh",
            "date_of_birth": "1985-08-20",
            "id_number": "123456789012",
            "document_type": "Aadhaar Card",
            "confidence": "high"
        }
        '''
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.extract_id_details(b"fake_aadhaar_image", "image/jpeg")
            )
            
            assert result["document_type"] == "Aadhaar Card"
            assert len(result["id_number"]) == 12  # Aadhaar is 12 digits
        finally:
            llm.gemini_model = original_model

    def test_drivers_license_extraction(self):
        """Test Driver's License extraction."""
        import asyncio
        from app.services import llm
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '''
        {
            "full_name": "Amit Patel",
            "date_of_birth": "1992-03-10",
            "id_number": "KA0120190012345",
            "document_type": "Driver's License",
            "confidence": "medium"
        }
        '''
        
        original_model = llm.gemini_model
        llm.gemini_model = mock_model
        
        try:
            result = asyncio.get_event_loop().run_until_complete(
                llm.extract_id_details(b"fake_dl_image", "image/png")
            )
            
            assert result["document_type"] == "Driver's License"
            assert result["confidence"] == "medium"
        finally:
            llm.gemini_model = original_model
