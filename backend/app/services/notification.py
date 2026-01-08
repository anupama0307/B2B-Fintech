"""
Notification Service for RISKOFF API.
Handles sending email/SMS alerts using SMTP or Twilio.
Currently implements a logging fallback for development.
"""

import os
import logging
from typing import Optional

# Configure logging
logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = os.getenv("SMTP_PORT")
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_from = os.getenv("TWILIO_FROM_NUMBER")

    async def send_email(self, to_email: str, subject: str, content: str) -> bool:
        """
        Send an email notification.
        """
        if self.smtp_server and self.smtp_user:
            # TODO: Implement actual SMTP sending
            # This would use aioSMTPd or smtplib
            logger.info(f"Sending EMAIL to {to_email}: {subject}")
            return True
        else:
            # Fallback to logging
            logger.info(f"Checking Notification (Mock EMAIL): To={to_email}, Subject={subject}, Content={content}")
            print(f"Checking Notification (Mock EMAIL): To={to_email}, Subject={subject}")
            return True

    async def send_sms(self, to_number: str, message: str) -> bool:
        """
        Send an SMS notification via Twilio.
        """
        if self.twilio_sid and self.twilio_token:
             # TODO: Implement actual Twilio sending
            logger.info(f"Sending SMS to {to_number}: {message}")
            return True
        else:
            # Fallback to logging
            logger.info(f"Checking Notification (Mock SMS): To={to_number}, Message={message}")
            print(f"Checking Notification (Mock SMS): To={to_number}, Message={message}")
            return True

    async def send_status_update(self, loan_id: str, new_status: str, applicant_email: Optional[str] = None):
        """
        Send a notification about loan status update.
        """
        subject = f"Loan Application Status Update: {new_status}"
        content = f"Your loan application ({loan_id}) has been updated to: {new_status}."
        
        logger.info(f"Processing status update for loan {loan_id} -> {new_status}")
        
        # Always log for admin visibility
        print(f"ALERT: Loan {loan_id} status changed to {new_status}")

        if applicant_email:
            await self.send_email(applicant_email, subject, content)

notification_service = NotificationService()
