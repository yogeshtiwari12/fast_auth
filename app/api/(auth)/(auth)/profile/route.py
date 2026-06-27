import sys
import os
from fastapi import FastAPI, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import models
import security

app = FastAPI()

@app.get("/api/profile")
@app.get("/")
def profile(authorization: str = Header(...), session_db: Session = Depends(db.get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authorization header format"
        )
        
    token = authorization.split(" ")[1]
    payload = security.verify_token(token)
    
    # Restrict to access tokens only
    if payload.get("token_type") != "access_token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided token is not a valid access token"
        )
    
    user_email = payload.get("sub")
    db_user = session_db.query(models.DbUser).filter(models.DbUser.email == user_email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User account not found"
        )

    if not db_user.isVerified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is unverified"
        )

    return {
        "success": True,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "phone": db_user.phone,
            "isVerified": db_user.isVerified
        }
    }
