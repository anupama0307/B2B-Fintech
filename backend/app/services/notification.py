"""
<<<<<<< HEAD
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
=======
Notification service for RISKOFF API.
Handles email notifications with mock mode for development.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional


def send_email_notification(
    to_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None
) -> bool:
    """
    Send email notification to user.
    
    Uses SMTP with Gmail if credentials are available.
    Falls back to mock mode (console logging) if credentials are missing.
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        body: Plain text email body
        html_body: Optional HTML body for rich emails
        
    Returns:
        True if email sent (or mocked) successfully, False on error
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    # Mock mode if credentials not configured
    if not smtp_email or not smtp_password:
        print(f"""
📧 [MOCK EMAIL]
   To: {to_email}
   Subject: {subject}
   Body: {body[:100]}{'...' if len(body) > 100 else ''}
""")
        return True
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = smtp_email
        message["To"] = to_email
        
        # Attach plain text
        part1 = MIMEText(body, "plain")
        message.attach(part1)
        
        # Attach HTML if provided
        if html_body:
            part2 = MIMEText(html_body, "html")
            message.attach(part2)
        
        # Send via Gmail SMTP (SSL)
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, message.as_string())
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print(f"⚠️ Email auth failed - check SMTP credentials")
        return False
    except smtplib.SMTPException as e:
        print(f"⚠️ SMTP error sending email: {e}")
        return False
    except Exception as e:
        # Never crash the app due to email failures
        print(f"⚠️ Email error (non-critical): {e}")
        return False


def send_loan_status_notification(
    to_email: str,
    user_name: str,
    loan_id: int,
    new_status: str,
    remarks: Optional[str] = None
) -> bool:
    """
    Send loan status update notification to user.
    
    Args:
        to_email: User's email address
        user_name: User's display name
        loan_id: Loan application ID
        new_status: New status (APPROVED, REJECTED, PENDING)
        remarks: Optional admin remarks
        
    Returns:
        True if notification sent successfully
    """
    status_emoji = {
        "APPROVED": "🎉",
        "REJECTED": "😔",
        "PENDING": "⏳"
    }
    
    emoji = status_emoji.get(new_status, "📋")
    
    subject = f"{emoji} RISKOFF - Your Loan Application Status Update"
    
    body = f"""Hello {user_name},

Your loan application (ID: #{loan_id}) status has been updated.

New Status: {new_status}
"""
    
    if remarks:
        body += f"\nRemarks: {remarks}\n"
    
    body += """
If you have any questions, please contact our support team.

Best regards,
RISKOFF Team
"""
    
    return send_email_notification(to_email, subject, body)
>>>>>>> origin/main
