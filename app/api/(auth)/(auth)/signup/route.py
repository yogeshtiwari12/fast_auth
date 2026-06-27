import sys
import os
import random
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import models
import security
from email_service import send_otp_email

db.Base.metadata.create_all(bind=db.engine)

app = FastAPI()

class UserSignup(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

@app.post("/api/signup")
@app.post("/")
def signup(user_in: UserSignup, session_db: Session = Depends(db.get_db)):
    # Check if username or email already exists in the database
    existing_user = session_db.query(models.DbUser).filter(
        (models.DbUser.email == user_in.email) | (models.DbUser.name == user_in.name)
    ).first()
    
    otp_code = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    hashed_pwd = security.get_password_hash(user_in.password)

    if existing_user:
        if existing_user.isVerified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address or username is already registered and verified."
            )
        else:
            # Overwrite unverified account details and send new OTP
            existing_user.password = hashed_pwd
            existing_user.otp = otp_code
            existing_user.verifyCodeExpiry = expiry
            session_db.commit()
    else:
        new_user = models.DbUser(
            name=user_in.name,
            email=user_in.email,
            password=hashed_pwd,
            otp=otp_code,
            verifyCodeExpiry=expiry
        )
        session_db.add(new_user)
        session_db.commit()
    
    # Send email containing the OTP verification code
    send_otp_email(user_in.email, otp_code)
    
    return {
        "success": True, 
        "message": "Verification code sent to your email address.",
        "otp_debug": otp_code # Keeps debugging simple locally
    }
