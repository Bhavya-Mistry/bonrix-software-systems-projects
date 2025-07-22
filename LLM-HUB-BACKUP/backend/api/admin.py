from fastapi import APIRouter, Depends, HTTPException, status, Form, Query, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import json
import time
from collections import defaultdict

from utils.database import get_db
from utils.auth import create_access_token, get_password_hash, verify_password, get_current_user, get_admin_user
from models.database import (
    User, Transaction, TaskLog, ModelConfig, CreditPackage, 
    SystemLog, PlatformSettings, StatementHistory
)

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

# Rate limiting for admin login
# Track login attempts by IP address
login_attempts: Dict[str, List[float]] = defaultdict(list)
MAX_ATTEMPTS = 5  # Maximum number of attempts allowed
WINDOW_SECONDS = 300  # Time window in seconds (5 minutes)
LOCKOUT_SECONDS = 1800  # Lockout period in seconds (30 minutes)

def is_rate_limited(ip_address: str) -> bool:
    """Check if an IP address is rate limited for admin login."""
    now = time.time()
    
    # Remove attempts older than the window
    login_attempts[ip_address] = [t for t in login_attempts[ip_address] if now - t < WINDOW_SECONDS]
    
    # Check if there are too many attempts
    if len(login_attempts[ip_address]) >= MAX_ATTEMPTS:
        # Check if the oldest attempt is still within the lockout period
        oldest_attempt = min(login_attempts[ip_address]) if login_attempts[ip_address] else now
        if now - oldest_attempt < LOCKOUT_SECONDS:
            return True
        else:
            # Reset attempts if lockout period has passed
            login_attempts[ip_address] = []
    
    return False

def record_login_attempt(ip_address: str):
    """Record a login attempt for an IP address."""
    login_attempts[ip_address].append(time.time())

# Admin login endpoint
@router.post("/login")
async def admin_login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Get client IP address
    client_ip = request.client.host
    
    # Check if the client is rate limited
    if is_rate_limited(client_ip):
        # Log the rate limit event
        log_entry = SystemLog(
            log_type="security",
            source="admin_login",
            message=f"Rate limit exceeded for admin login attempts from IP {client_ip}",
            details={"ip_address": client_ip, "timestamp": datetime.utcnow().isoformat()}
        )
        db.add(log_entry)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )
    
    # Record this login attempt
    record_login_attempt(client_ip)
    
    # Find the user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Check if user exists, password is correct, and user is an admin
    if not user or not verify_password(form_data.password, user.password_hash) or user.is_admin != 1:
        # Log failed login attempt
        log_entry = SystemLog(
            log_type="security",
            source="admin_login",
            message=f"Failed admin login attempt for user {form_data.username} from IP {client_ip}",
            details={"ip_address": client_ip, "timestamp": datetime.utcnow().isoformat()}
        )
        db.add(log_entry)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password, or not authorized as admin",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Log successful login
    log_entry = SystemLog(
        log_type="security",
        source="admin_login",
        message=f"Successful admin login for user {user.email} from IP {client_ip}",
        details={"ip_address": client_ip, "user_id": user.id, "timestamp": datetime.utcnow().isoformat()},
        user_id=user.id
    )
    db.add(log_entry)
    db.commit()
    
    # Create a token with shorter expiry for admin sessions (24 hours)
    access_token = create_access_token(
        data={"sub": str(user.id), "is_admin": True},
        expires_delta=timedelta(hours=24)
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email}}

# Dashboard overview statistics
@router.get("/dashboard/stats")
async def get_dashboard_stats(current_admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    # Get total number of users
    total_users = db.query(func.count(User.id)).scalar()
    
    # Get total credits purchased
    total_credits_purchased = db.query(func.sum(Transaction.amount)).scalar() or 0
    
    # Calculate total revenue
    # Assuming transactions store the amount in credits, not currency
    # We'll need to calculate based on the credit packages or conversion rate
    total_revenue_inr = db.query(func.sum(Transaction.amount)).scalar() or 0
    # For simplicity, we're using a conversion rate of 75 INR = 1 USD
    total_revenue_usd = total_revenue_inr / 75
    
    # Get active users in last 24h
    yesterday = datetime.utcnow() - timedelta(days=1)
    active_users_24h = db.query(func.count(User.id)).filter(
        User.id.in_(
            db.query(TaskLog.user_id).filter(TaskLog.timestamp > yesterday).distinct()
        )
    ).scalar()
    
    # Get active users in last 7d
    last_week = datetime.utcnow() - timedelta(days=7)
    active_users_7d = db.query(func.count(User.id)).filter(
        User.id.in_(
            db.query(TaskLog.user_id).filter(TaskLog.timestamp > last_week).distinct()
        )
    ).scalar()
    
    # Get top used LLM models
    top_models = db.query(
        TaskLog.model_used, 
        func.count(TaskLog.id).label('usage_count')
    ).group_by(
        TaskLog.model_used
    ).order_by(
        desc('usage_count')
    ).limit(5).all()
    
    # Format top models for response
    top_models_data = [{"model": model, "count": count} for model, count in top_models]
    
    return {
        "total_users": total_users,
        "total_credits_purchased": total_credits_purchased,
        "total_revenue_inr": total_revenue_inr,
        "total_revenue_usd": total_revenue_usd,
        "active_users_24h": active_users_24h,
        "active_users_7d": active_users_7d,
        "top_models": top_models_data
    }

# User management endpoints
@router.post("/users/create")
async def create_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    credits: float = Form(0.0),
    is_admin: bool = Form(False),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user."""
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed_password,
        credits=credits,
        is_admin=1 if is_admin else 0,
        created_at=datetime.utcnow()
    )
    
    # Add to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log the action
    log_entry = SystemLog(
        log_type="admin",
        source="user_management",
        message=f"Admin {current_admin.email} created new user {email}",
        details={
            "admin_id": current_admin.id,
            "user_id": new_user.id,
            "user_email": email,
            "is_admin": is_admin
        },
        user_id=current_admin.id
    )
    db.add(log_entry)
    db.commit()
    
    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "credits": new_user.credits,
        "is_admin": new_user.is_admin,
        "created_at": new_user.created_at
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user."""
    # Find the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting self
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Log the action before deleting
    log_entry = SystemLog(
        log_type="admin",
        source="user_management",
        message=f"Admin {current_admin.email} deleted user {user.email}",
        details={
            "admin_id": current_admin.id,
            "user_id": user.id,
            "user_email": user.email
        },
        user_id=current_admin.id
    )
    db.add(log_entry)
    
    # Delete the user
    db.delete(user)
    db.commit()
    
    return {"detail": "User deleted successfully"}

# Get all users
@router.get("/users")
async def get_all_users(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    
    # Apply search filter if provided
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )
    
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    # Format user data
    user_data = []
    for user in users:
        # Get total credits purchased
        credits_purchased = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user.id
        ).scalar() or 0
        
        user_data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "credits": user.credits,
            "is_admin": user.is_admin,
            "credits_purchased": credits_purchased,
            "signup_date": user.created_at
        })
    
    return {"total": total, "users": user_data}

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: int,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get total credits purchased
    credits_purchased = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id
    ).scalar() or 0
    
    # Get transaction history
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user.id
    ).order_by(desc(Transaction.timestamp)).limit(10).all()
    
    # Get task history
    tasks = db.query(TaskLog).filter(
        TaskLog.user_id == user.id
    ).order_by(desc(TaskLog.timestamp)).limit(10).all()
    
    # Format transaction data
    transaction_data = []
    for tx in transactions:
        transaction_data.append({
            "id": tx.id,
            "amount": tx.amount,
            "method": tx.method,
            "status": tx.status,
            "timestamp": tx.timestamp
        })
    
    # Format task data
    task_data = []
    for task in tasks:
        task_data.append({
            "id": task.id,
            "task_type": task.task_type,
            "model_used": task.model_used,
            "tokens_used": task.tokens_used,
            "credit_cost": task.credit_cost,
            "timestamp": task.timestamp
        })
    
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "credits": user.credits,
            "is_admin": user.is_admin,
            "credits_purchased": credits_purchased,
            "signup_date": user.created_at
        },
        "recent_transactions": transaction_data,
        "recent_tasks": task_data
    }

@router.put("/users/{user_id}/credits")
async def update_user_credits(
    user_id: int,
    credits: float = Form(...),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    previous_credits = user.credits
    
    # Update user credits
    user.credits = credits
    db.commit()
    
    # Log the action
    log = SystemLog(
        log_type="info",
        source="admin",
        message=f"Admin {current_admin.name} updated credits for user {user.email}",
        details=json.dumps({
            "admin_id": current_admin.id,
            "user_id": user.id,
            "previous_credits": previous_credits,
            "new_credits": credits
        }),
        user_id=user.id
    )
    db.add(log)
    db.commit()
    
    return {"message": "User credits updated successfully"}

@router.post("/users/{user_id}/assign-credits")
async def assign_credits_to_user(
    user_id: int,
    amount: float = Form(...),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Assign (add) credits to a user's account by admin"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    
    previous_credits = user.credits
    user.credits += amount
    
    # Create a transaction record
    transaction = Transaction(
        user_id=user.id,
        amount=amount,
        method="admin_assignment",
        status="completed",
        payment_id=f"admin_{current_admin.id}_{int(time.time())}"
    )
    db.add(transaction)
    
    # Log the action
    log = SystemLog(
        log_type="info",
        source="admin",
        message=f"Admin {current_admin.name} assigned {amount} credits to user {user.email}",
        details=json.dumps({
            "admin_id": current_admin.id,
            "user_id": user.id,
            "previous_credits": previous_credits,
            "assigned_amount": amount,
            "new_credits": user.credits
        }),
        user_id=user.id
    )
    db.add(log)
    db.commit()
    
    return {
        "message": f"Successfully assigned {amount} credits to user",
        "user_id": user.id,
        "user_email": user.email,
        "previous_credits": previous_credits,
        "assigned_amount": amount,
        "new_balance": user.credits
    }

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool = Form(...),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # For now, we'll use credits as a proxy for account status
    # In a real system, you'd have a dedicated is_active field
    if not is_active:
        user.credits = -1  # Negative credits indicate a banned account
    elif user.credits < 0:
        user.credits = 0  # Reset to 0 if unbanning
    
    db.commit()
    
    # Log the action
    log = SystemLog(
        log_type="info",
        source="admin",
        message=f"Admin {current_admin.name} {'deactivated' if not is_active else 'activated'} user {user.email}",
        details=json.dumps({
            "admin_id": current_admin.id,
            "user_id": user.id,
            "is_active": is_active
        }),
        user_id=user.id
    )
    db.add(log)
    db.commit()
    
    return {"message": f"User {'deactivated' if not is_active else 'activated'} successfully"}

# Transaction history endpoints
@router.get("/transactions")
async def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    payment_method: Optional[str] = None,
    status: Optional[str] = None,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    # Apply filters
    if start_date:
        query = query.filter(Transaction.timestamp >= start_date)
    if end_date:
        query = query.filter(Transaction.timestamp <= end_date)
    if payment_method:
        query = query.filter(Transaction.method == payment_method)
    if status:
        query = query.filter(Transaction.status == status)
    
    total = query.count()
    transactions = query.order_by(desc(Transaction.timestamp)).offset(skip).limit(limit).all()
    
    # Format transaction data
    transaction_data = []
    for tx in transactions:
        # Get user email
        user = db.query(User).filter(User.id == tx.user_id).first()
        user_email = user.email if user else "Unknown"
        
        transaction_data.append({
            "id": tx.id,
            "user_id": tx.user_id,
            "user_email": user_email,
            "amount": tx.amount,
            "method": tx.method,
            "status": tx.status,
            "payment_id": tx.payment_id,
            "timestamp": tx.timestamp
        })
    
    return {"total": total, "transactions": transaction_data}

# Task logs endpoints
@router.get("/task-logs")
async def get_all_task_logs(
    skip: int = 0,
    limit: int = 100,
    task_type: Optional[str] = None,
    model_used: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(TaskLog)
    
    # Apply filters
    if task_type:
        query = query.filter(TaskLog.task_type == task_type)
    if model_used:
        query = query.filter(TaskLog.model_used == model_used)
    if start_date:
        query = query.filter(TaskLog.timestamp >= start_date)
    if end_date:
        query = query.filter(TaskLog.timestamp <= end_date)
    
    total = query.count()
    task_logs = query.order_by(desc(TaskLog.timestamp)).offset(skip).limit(limit).all()
    
    # Format task log data
    task_log_data = []
    for log in task_logs:
        # Get user email
        user = db.query(User).filter(User.id == log.user_id).first()
        user_email = user.email if user else "Unknown"
        
        task_log_data.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_email": user_email,
            "task_type": log.task_type,
            "model_used": log.model_used,
            "tokens_used": log.tokens_used,
            "credit_cost": log.credit_cost,
            "timestamp": log.timestamp
        })
    
    return {"total": total, "task_logs": task_log_data}

@router.get("/task-logs/{log_id}")
async def get_task_log_details(
    log_id: int,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    log = db.query(TaskLog).filter(TaskLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Task log not found")
    
    # Get user email
    user = db.query(User).filter(User.id == log.user_id).first()
    user_email = user.email if user else "Unknown"
    
    return {
        "id": log.id,
        "user_id": log.user_id,
        "user_email": user_email,
        "task_type": log.task_type,
        "model_used": log.model_used,
        "tokens_used": log.tokens_used,
        "credit_cost": log.credit_cost,
        "result_json": log.result_json,
        "timestamp": log.timestamp
    }

# Credit packages management endpoints
@router.get("/credit-packages")
async def get_all_credit_packages(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    packages = db.query(CreditPackage).order_by(CreditPackage.credits).all()
    return [
        {
            "id": pkg.id,
            "name": pkg.name,
            "credits": pkg.credits,
            "price_inr": pkg.price_inr,
            "price_usd": pkg.price_usd,
            "is_active": pkg.is_active,
            "is_promotional": pkg.is_promotional,
            "discount_percentage": pkg.discount_percentage
        }
        for pkg in packages
    ]

@router.post("/credit-packages")
async def create_credit_package(
    name: str = Form(...),
    credits: float = Form(...),
    price_inr: float = Form(...),
    price_usd: float = Form(...),
    is_promotional: bool = Form(False),
    discount_percentage: float = Form(0.0),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    new_package = CreditPackage(
        name=name,
        credits=credits,
        price_inr=price_inr,
        price_usd=price_usd,
        is_promotional=1 if is_promotional else 0,
        discount_percentage=discount_percentage
    )
    
    db.add(new_package)
    db.commit()
    db.refresh(new_package)
    
    return new_package

@router.put("/credit-packages/{package_id}")
async def update_credit_package(
    package_id: int,
    name: str = Form(...),
    credits: float = Form(...),
    price_inr: float = Form(...),
    price_usd: float = Form(...),
    is_active: bool = Form(True),
    is_promotional: bool = Form(False),
    discount_percentage: float = Form(0.0),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    package = db.query(CreditPackage).filter(CreditPackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Credit package not found")
    
    package.name = name
    package.credits = credits
    package.price_inr = price_inr
    package.price_usd = price_usd
    package.is_active = 1 if is_active else 0
    package.is_promotional = 1 if is_promotional else 0
    package.discount_percentage = discount_percentage
    package.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(package)
    
    return package

@router.delete("/credit-packages/{package_id}")
async def delete_credit_package(
    package_id: int,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    package = db.query(CreditPackage).filter(CreditPackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Credit package not found")
    
    db.delete(package)
    db.commit()
    
    return {"message": "Credit package deleted successfully"}

# Model configuration endpoints
@router.get("/model-configs")
async def get_all_model_configs(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    models = db.query(ModelConfig).order_by(ModelConfig.provider, ModelConfig.model_name).all()
    return models

@router.post("/model-configs")
async def create_model_config(
    model_name: str = Form(...),
    provider: str = Form(...),
    token_cost_multiplier: float = Form(1.0),
    description: str = Form(None),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Check if model already exists
    existing_model = db.query(ModelConfig).filter(ModelConfig.model_name == model_name).first()
    if existing_model:
        raise HTTPException(status_code=400, detail="Model already exists")
    
    new_model = ModelConfig(
        model_name=model_name,
        provider=provider,
        token_cost_multiplier=token_cost_multiplier,
        description=description
    )
    
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    
    return new_model

@router.put("/model-configs/{model_id}")
async def update_model_config(
    model_id: int,
    is_active: bool = Form(...),
    token_cost_multiplier: float = Form(...),
    description: str = Form(None),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    model = db.query(ModelConfig).filter(ModelConfig.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model configuration not found")
    
    model.is_active = 1 if is_active else 0
    model.token_cost_multiplier = token_cost_multiplier
    if description is not None:
        model.description = description
    model.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(model)
    
    return model

# Platform settings endpoints
@router.get("/settings")
async def get_all_settings(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    settings = db.query(PlatformSettings).all()
    
    # Filter out secure settings values
    settings_data = []
    for setting in settings:
        setting_dict = {
            "id": setting.id,
            "key": setting.key,
            "description": setting.description,
            "is_secure": setting.is_secure,
            "updated_at": setting.updated_at
        }
        
        # Only include value if it's not a secure setting
        if setting.is_secure == 0:
            setting_dict["value"] = setting.value
        else:
            setting_dict["value"] = "********"  # Mask secure values
        
        settings_data.append(setting_dict)
    
    return settings_data

@router.post("/settings")
async def create_setting(
    key: str = Form(...),
    value: str = Form(...),
    description: str = Form(None),
    is_secure: bool = Form(False),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Check if setting already exists
    existing_setting = db.query(PlatformSettings).filter(PlatformSettings.key == key).first()
    if existing_setting:
        raise HTTPException(status_code=400, detail="Setting already exists")
    
    new_setting = PlatformSettings(
        key=key,
        value=value,
        description=description,
        is_secure=1 if is_secure else 0,
        updated_by=current_admin.id
    )
    
    db.add(new_setting)
    db.commit()
    db.refresh(new_setting)
    
    # Mask value if secure
    if new_setting.is_secure == 1:
        new_setting.value = "********"
    
    return new_setting

@router.put("/settings/{setting_id}")
async def update_setting(
    setting_id: int,
    value: str = Form(...),
    description: str = Form(None),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    setting = db.query(PlatformSettings).filter(PlatformSettings.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    setting.value = value
    if description is not None:
        setting.description = description
    setting.updated_at = datetime.utcnow()
    setting.updated_by = current_admin.id
    
    db.commit()
    db.refresh(setting)
    
    # Mask value if secure
    if setting.is_secure == 1:
        setting.value = "********"
    
    return setting

# User statement history endpoints
@router.get("/user-statements/{user_id}")
async def get_user_statement_history(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed statement history for a specific user (admin only)
    """
    # Verify the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Query the statement history for the specified user
    query = db.query(StatementHistory).filter(StatementHistory.user_id == user_id)
    
    # Apply date filters if provided
    if start_date:
        query = query.filter(StatementHistory.timestamp >= start_date)
    if end_date:
        query = query.filter(StatementHistory.timestamp <= end_date)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    statements = query.order_by(StatementHistory.timestamp.desc()).offset(skip).limit(limit).all()
    
    # Calculate summary data
    total_credits = sum(stmt.credit for stmt in statements)
    total_debits = sum(stmt.debit for stmt in statements)
    total_purchases = sum(stmt.purchase_amount for stmt in statements)
    
    # Get first and last statement for the period to calculate balance change
    first_statement = query.order_by(StatementHistory.timestamp.asc()).first()
    last_statement = query.order_by(StatementHistory.timestamp.desc()).first()
    
    opening_balance = first_statement.opening_balance if first_statement else 0
    closing_balance = last_statement.closing_balance if last_statement else user.credits
    
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "current_credits": user.credits
        },
        "summary": {
            "total_credits": total_credits,
            "total_debits": total_debits,
            "total_purchases": total_purchases,
            "opening_balance": opening_balance,
            "closing_balance": closing_balance,
            "net_change": closing_balance - opening_balance,
        },
        "total": total_count,
        "items": statements,
        "limit": limit,
        "offset": skip
    }

# System logs endpoints
@router.get("/system-logs")
async def get_system_logs(
    skip: int = 0,
    limit: int = 100,
    log_type: Optional[str] = None,
    source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(SystemLog)
    
    # Apply filters
    if log_type:
        query = query.filter(SystemLog.log_type == log_type)
    if source:
        query = query.filter(SystemLog.source == source)
    if start_date:
        query = query.filter(SystemLog.timestamp >= start_date)
    if end_date:
        query = query.filter(SystemLog.timestamp <= end_date)
    
    total = query.count()
    logs = query.order_by(desc(SystemLog.timestamp)).offset(skip).limit(limit).all()
    
    # Format log data
    log_data = []
    for log in logs:
        # Get user email if user_id is present
        user_email = None
        if log.user_id:
            user = db.query(User).filter(User.id == log.user_id).first()
            user_email = user.email if user else None
        
        log_data.append({
            "id": log.id,
            "log_type": log.log_type,
            "source": log.source,
            "message": log.message,
            "details": log.details,
            "user_id": log.user_id,
            "user_email": user_email,
            "timestamp": log.timestamp
        })
    
    return {"total": total, "logs": log_data}
