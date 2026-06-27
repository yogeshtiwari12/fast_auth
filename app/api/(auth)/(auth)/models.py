import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from db import Base

class DbUser(Base):
    # Match the exact table name created by Prisma (case-sensitive "User")
    __tablename__ = "User"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="USER")
    isVerified = Column(Boolean, default=False)
    phone = Column(String, nullable=True)
    otp = Column(String, nullable=True)
    verifyCodeExpiry = Column(DateTime, nullable=True)
    refreshToken = Column(String, nullable=True)
