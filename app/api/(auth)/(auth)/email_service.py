import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()

def send_otp_email(to_email: str, otp_code: str, email_type: str = "register"):
    # Retrieve Next.js url (defaults to localhost:3000 in development)
    nextauth_url = os.getenv("NEXTAUTH_URL", "http://localhost:3000")
    url = f"{nextauth_url}/api/send-email"
    
    payload = json.dumps({"to": to_email, "otp": otp_code, "type": email_type}).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        # Request Next.js Nodemailer route
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                print(f"📧 OTP verification email ({email_type}) successfully sent via Nodemailer to {to_email}")
                return True
            else:
                print(f"❌ Nodemailer route returned status: {response.status}")
                return False
    except Exception as e:
        print(f"❌ Failed to request Nodemailer endpoint: {e}")
        return False
