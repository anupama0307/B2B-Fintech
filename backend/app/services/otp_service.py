import random
import string
from datetime import datetime, timedelta

def generate_otp(length:  int = 6) -> str:
    return ''.join(random.choices(string. digits, k=length))

def get_otp_expiry(minutes: int = 10) -> datetime:
    return datetime.utcnow() + timedelta(minutes=minutes)

def is_otp_valid(stored_otp: str, input_otp: str, expires_at: datetime) -> bool:
    if stored_otp != input_otp: 
        return False
    if datetime.utcnow() > expires_at:
        return False
    return True

def send_otp_email(email:  str, otp:  str) -> bool:
    # For demo, just print OTP
    print("\n" + "=" * 50)
    print("OTP for " + email + ": " + otp)
    print("=" * 50 + "\n")
    return True