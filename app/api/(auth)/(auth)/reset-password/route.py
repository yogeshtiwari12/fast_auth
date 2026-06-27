import sys
import os
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import models
import security

app = FastAPI()

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=6)

@app.post("/api/reset-password")
@app.post("/")
def reset_password(req: ResetPasswordRequest, session_db: Session = Depends(db.get_db)):
    db_user = session_db.query(models.DbUser).filter(models.DbUser.email == req.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User account not found"
        )
        
    if not db_user.otp or db_user.otp != req.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid verification code"
        )
        
    expiry = db_user.verifyCodeExpiry
    if expiry:
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
            
        if expiry < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Verification code has expired. Please request a new one."
            )

    # Hash and save the new password
    hashed_pwd = security.get_password_hash(req.new_password)
    db_user.password = hashed_pwd
    
    # Clear the OTP fields
    db_user.otp = None
    db_user.verifyCodeExpiry = None
    session_db.commit()
    
    return {"success": True, "message": "Password has been reset successfully"}
