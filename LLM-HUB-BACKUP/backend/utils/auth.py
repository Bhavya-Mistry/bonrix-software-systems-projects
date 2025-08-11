from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from models.database import User
from utils.database import get_db

load_dotenv()

# Secret key for JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current user from the JWT token."""
    import os
    import sys
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print("[AUTH DEBUG] Incoming token:", token, file=sys.stderr)
    print("[AUTH DEBUG] SECRET_KEY (first 8 chars):", str(SECRET_KEY)[:8], file=sys.stderr)
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        print("[AUTH DEBUG] Decoded payload:", payload, file=sys.stderr)
        if user_id is None:
            print("[AUTH DEBUG] No user_id in payload", file=sys.stderr)
            raise credentials_exception
    except JWTError as e:
        print(f"[AUTH DEBUG] JWTError: {e}", file=sys.stderr)
        raise credentials_exception
    # Get the user from the database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        print("[AUTH DEBUG] No user found in DB for user_id:", user_id, file=sys.stderr)
        raise credentials_exception
    print("[AUTH DEBUG] Authenticated user:", user.email if hasattr(user, 'email') else user.id, file=sys.stderr)
    return user

def get_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current admin user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    permission_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized to access admin resources",
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin", False)
        
        if user_id is None:
            raise credentials_exception
            
        # Check if the token has admin claim
        if not is_admin:
            raise permission_exception
            
    except JWTError:
        raise credentials_exception
        
    # Get the user from the database
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
        
    # Double-check that the user is actually an admin in the database
    if user.is_admin != 1:
        raise permission_exception
        
    return user
