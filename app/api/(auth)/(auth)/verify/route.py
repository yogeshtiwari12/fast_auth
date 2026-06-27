import sys
import os
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import models

app = FastAPI()

class VerifyOTP(BaseModel):
    name: str
    otp: str

@app.post("/api/verify")
@app.post("/")
def verify(verify_in: VerifyOTP, session_db: Session = Depends(db.get_db)):
    db_user = session_db.query(models.DbUser).filter(models.DbUser.name == verify_in.name).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    if db_user.isVerified:
        return {"success": True, "message": "User is already verified"}

    if not db_user.otp or db_user.otp != verify_in.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid verification code"
        )
    
    # Ensure compare is timezone aware
    expiry = db_user.verifyCodeExpiry
    if expiry:
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        
        if expiry < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Verification code has expired. Please sign up again."
            )

    db_user.isVerified = True
    # Clear the OTP fields once used to prevent replay attacks
    db_user.otp = None
    db_user.verifyCodeExpiry = None
    
    session_db.commit()
    return {"success": True, "message": "User verified successfully"}
