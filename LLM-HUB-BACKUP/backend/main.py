from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from utils.database import get_db, engine
from models.database import Base
from utils.auth import create_access_token, get_password_hash, verify_password, get_current_user
from models.database import User, Transaction, TaskLog, StatementHistory

# Import API routers
from api.resume_analysis import router as resume_router
from api.object_detection import router as object_detection_router
from api.invoice_extraction import router as invoice_router
from api.text_summarization import router as summarization_router
from api.sentiment_analysis import router as sentiment_router
from api.custom_prompt import router as custom_prompt_router
from api.payment import router as payment_router
from api.admin import router as admin_router
from api.statement import router as statement_router

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Windsurf API",
    description="API for Windsurf - Multi-Task AI Assistant",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(resume_router)
app.include_router(object_detection_router)
app.include_router(invoice_router)
app.include_router(summarization_router)
app.include_router(sentiment_router)
app.include_router(custom_prompt_router)
app.include_router(payment_router)
app.include_router(admin_router)
app.include_router(statement_router)

# Authentication endpoint
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find the user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}

# User registration endpoint
@app.post("/users/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    db: Session = Depends(get_db)
):
    # Validate inputs
    if not email or not password or not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields are required"
        )
    
    # Validate email format
    if '@' not in email or '.' not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password length
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(password)
    new_user = User(email=email, password_hash=hashed_password, name=name, credits=100.0)  # Start with 100 free credits
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully", "user_id": new_user.id}

# Get current user profile
@app.get("/users/me")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "credits": current_user.credits,
        "created_at": current_user.created_at
    }

# Get user transaction history
@app.get("/users/transactions")
async def get_user_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    return transactions

# Get user task history
@app.get("/users/tasks")
async def get_user_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(TaskLog).filter(TaskLog.user_id == current_user.id).all()
    return tasks

# Get user statement history
@app.get("/users/statement")
async def get_user_statement(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    statements = db.query(StatementHistory).filter(StatementHistory.user_id == current_user.id).order_by(StatementHistory.timestamp.desc()).all()
    return statements

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Windsurf API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
