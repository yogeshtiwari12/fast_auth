import sys
import os
from fastapi import FastAPI, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import models
import security

app = FastAPI()

@app.post("/api/logout")
@app.post("/")
def logout(authorization: str = Header(...), session_db: Session = Depends(db.get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authorization header format"
        )
        
    token = authorization.split(" ")[1]
    payload = security.verify_token(token)
    
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
            detail="User not found"
        )
        
    # Invalidate session refresh tokens
    db_user.refreshToken = None
    session_db.commit()
    return {"success": True, "message": "Successfully logged out"}
