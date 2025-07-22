from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from utils.database import get_db
from utils.auth import get_current_user
from models.database import User, Transaction, TaskLog, StatementHistory
from services.credit_service import update_user_credits

router = APIRouter(
    prefix="/statement",
    tags=["statement"],
    responses={404: {"description": "Not found"}},
)

@router.get("/history")
async def get_statement_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get detailed statement history for the current user with optional date filtering
    """
    query = db.query(StatementHistory).filter(StatementHistory.user_id == current_user.id)
    
    # Apply date filters if provided
    if start_date:
        query = query.filter(StatementHistory.timestamp >= start_date)
    if end_date:
        query = query.filter(StatementHistory.timestamp <= end_date)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    statements = query.order_by(StatementHistory.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total_count,
        "items": statements,
        "limit": limit,
        "offset": offset
    }

@router.get("/summary")
async def get_statement_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    period: str = "month"  # Options: "week", "month", "year", "all"
):
    """
    Get summary of statement history (total credits, debits, etc.) for a specific period
    """
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:  # "all"
        start_date = None
    
    # Build query
    query = db.query(StatementHistory).filter(StatementHistory.user_id == current_user.id)
    if start_date:
        query = query.filter(StatementHistory.timestamp >= start_date)
    
    # Get all relevant statements
    statements = query.all()
    
    # Calculate summary
    total_credits = sum(stmt.credit for stmt in statements)
    total_debits = sum(stmt.debit for stmt in statements)
    total_purchases = sum(stmt.purchase_amount for stmt in statements)
    
    # Get first and last statement for the period to calculate balance change
    first_statement = query.order_by(StatementHistory.timestamp.asc()).first()
    last_statement = query.order_by(StatementHistory.timestamp.desc()).first()
    
    opening_balance = first_statement.opening_balance if first_statement else current_user.credits
    closing_balance = last_statement.closing_balance if last_statement else current_user.credits
    
    return {
        "period": period,
        "total_credits": total_credits,
        "total_debits": total_debits,
        "total_purchases": total_purchases,
        "opening_balance": opening_balance,
        "closing_balance": closing_balance,
        "net_change": closing_balance - opening_balance,
        "transaction_count": len(statements)
    }

@router.post("/generate")
async def generate_statement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a complete statement history based on existing transactions and task logs
    This is primarily for admin use or initial setup
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can generate statements"
        )
    
    # Clear existing statements (optional)
    db.query(StatementHistory).delete()
    
    # Get all users
    users = db.query(User).all()
    
    for user in users:
        # Get all transactions for this user
        transactions = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.timestamp).all()
        
        # Get all task logs for this user
        task_logs = db.query(TaskLog).filter(TaskLog.user_id == user.id).order_by(TaskLog.timestamp).all()
        
        # Start with initial balance (0)
        current_balance = 0.0
        
        # Process transactions (credits)
        for tx in transactions:
            # Create statement entry for each transaction
            opening_balance = current_balance
            current_balance += tx.amount  # Add credits
            
            statement = StatementHistory(
                user_id=user.id,
                username=user.name,
                email=user.email,
                credit=tx.amount,
                debit=0.0,
                purchase_amount=tx.amount if tx.amount > 0 else 0.0,
                opening_balance=opening_balance,
                closing_balance=current_balance,
                transaction_type="purchase",
                description=f"Credit purchase via {tx.method}",
                reference_id=tx.id,
                timestamp=tx.timestamp
            )
            
            db.add(statement)
        
        # Process task logs (debits)
        for task in task_logs:
            # Create statement entry for each task usage
            opening_balance = current_balance
            current_balance -= task.credit_cost  # Subtract credits used
            
            statement = StatementHistory(
                user_id=user.id,
                username=user.name,
                email=user.email,
                credit=0.0,
                debit=task.credit_cost,
                purchase_amount=0.0,
                opening_balance=opening_balance,
                closing_balance=current_balance,
                transaction_type="usage",
                description=f"Credits used for {task.task_type} task",
                reference_id=task.id,
                timestamp=task.timestamp
            )
            
            db.add(statement)
    
    # Commit all changes
    db.commit()
    
    return {"message": "Statement history generated successfully for all users"}

@router.post("/record")
async def record_statement_entry(
    transaction_type: str = Form(...),  # "purchase", "usage", "refund", "admin_adjustment"
    credit_amount: float = Form(0.0),
    debit_amount: float = Form(0.0),
    purchase_amount: float = Form(0.0),
    description: str = Form(...),
    reference_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record a new statement entry and update user's credit balance
    """
    # Calculate net change to user's credits
    net_change = credit_amount - debit_amount
    
    # Get current balance
    opening_balance = current_user.credits
    closing_balance = opening_balance + net_change
    
    # Create statement entry
    statement = StatementHistory(
        user_id=current_user.id,
        username=current_user.name,
        email=current_user.email,
        credit=credit_amount,
        debit=debit_amount,
        purchase_amount=purchase_amount,
        opening_balance=opening_balance,
        closing_balance=closing_balance,
        transaction_type=transaction_type,
        description=description,
        reference_id=reference_id
    )
    
    db.add(statement)
    
    # Update user's credit balance
    update_user_credits(db, current_user.id, net_change)
    
    db.commit()
    db.refresh(statement)
    
    return statement
