import sys
import os
from fastapi import FastAPI, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import db
import models
import security

app = FastAPI()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/auth/login")
@app.post("/login")
def login(user_in: UserLogin, session_db: Session = Depends(db.get_db)):
    db_user = session_db.query(models.DbUser).filter(models.DbUser.email == user_in.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email address or password"
        )
    
    if not security.verify_password(user_in.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email address or password"
        )
    
    if not db_user.isVerified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Your account has not been verified yet. Please check your verification code."
        )

    user_data = {"sub": db_user.email, "id": db_user.id, "role": db_user.role}
    access_token = security.create_access_token(user_data)
    refresh_token = security.create_refresh_token(user_data)

    db_user.refreshToken = refresh_token
    session_db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }

@app.post("/api/auth/refresh")
@app.post("/refresh")
def refresh(authorization: str = Header(...), session_db: Session = Depends(db.get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    refresh_token = authorization.split(" ")[1]
    payload = security.verify_token(refresh_token)
    
    if payload.get("token_type") != "refresh_token":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid token type"
        )
    
    user_email = payload.get("sub")
    db_user = session_db.query(models.DbUser).filter(
        (models.DbUser.email == user_email) & (models.DbUser.refreshToken == refresh_token)
    ).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Refresh token is invalid or has expired"
        )
    
    user_data = {"sub": db_user.email, "id": db_user.id, "role": db_user.role}
    new_access = security.create_access_token(user_data)
    new_refresh = security.create_refresh_token(user_data)

    db_user.refreshToken = new_refresh
    session_db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh
    }
