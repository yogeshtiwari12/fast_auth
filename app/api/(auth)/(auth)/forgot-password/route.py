import sys
import os
import random
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import models
from email_service import send_otp_email

app = FastAPI()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@app.post("/api/forgot-password")
@app.post("/")
def forgot_password(req: ForgotPasswordRequest, session_db: Session = Depends(db.get_db)):
    db_user = session_db.query(models.DbUser).filter(models.DbUser.email == req.email).first()
    
    # Security best practice: Don't reveal if email exists, just return success
    if not db_user:
        return {"success": True, "message": "If the email is registered, a password reset code has been sent."}
        
    otp_code = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=15) # 15 minutes validity for reset OTP
    
    db_user.otp = otp_code
    db_user.verifyCodeExpiry = expiry
    session_db.commit()
    
    # Send email containing the reset code with the "reset" type template
    send_otp_email(db_user.email, otp_code, "reset")
    
    return {
        "success": True, 
        "message": "If the email is registered, a password reset code has been sent.",
        "otp_debug": otp_code # Dev helper
    }
