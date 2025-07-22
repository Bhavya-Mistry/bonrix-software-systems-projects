from sqlalchemy.orm import Session
from typing import Optional
from models.database import User, Transaction, StatementHistory

# Credit cost rates per 1000 tokens for different models
MODEL_RATES = {
    "gpt-4": 30,
    "gpt-3.5-turbo": 5,
    "mistral-medium": 10,
    "mistral-small": 3,
    "mistral-7b": 2,
    "llama2": 1,
    "llama3": 2
}

# Base token estimates for different tasks
TASK_BASE_TOKENS = {
    "resume_analysis": 1500,
    "object_detection": 500,
    "invoice_extraction": 1000,
    "text_summarization": 500,
    "sentiment_analysis": 500,
    "custom_prompt": 300
}

def estimate_token_usage(task_type: str, input_length: Optional[int] = None) -> int:
    """
    Estimate the number of tokens that will be used for a task.
    
    Args:
        task_type: Type of task
        input_length: Length of input text (if applicable)
        
    Returns:
        Estimated number of tokens
    """
    base_tokens = TASK_BASE_TOKENS.get(task_type, 500)
    
    # Adjust based on input length if provided
    if input_length is not None:
        # Rough estimate: 1 token ≈ 4 characters for English text
        input_tokens = input_length // 4
        
        # For tasks that process text, add the input tokens
        if task_type in ["text_summarization", "sentiment_analysis", "custom_prompt"]:
            return base_tokens + input_tokens
        
        # For other tasks, scale the base tokens based on input size
        elif task_type in ["resume_analysis", "invoice_extraction"]:
            scaling_factor = max(1.0, input_tokens / 1000)
            return int(base_tokens * min(scaling_factor, 3.0))  # Cap at 3x base
    
    return base_tokens

def calculate_credit_cost(tokens: int, model: str) -> float:
    """
    Calculate the credit cost for a given number of tokens and model.
    
    Args:
        tokens: Number of tokens
        model: Model name
        
    Returns:
        Credit cost
    """
    # Get the rate for the model, or use a default rate
    rate = MODEL_RATES.get(model, 10)  # Default to 10 credits per 1000 tokens
    
    # Calculate the cost: (tokens / 1000) * rate
    return (tokens / 1000) * rate

def deduct_credits(db: Session, user_id: int, amount: float, task_type: str = "usage") -> bool:
    """
    Deduct credits from a user's account.
    
    Args:
        db: Database session
        user_id: User ID
        amount: Amount of credits to deduct
        task_type: Type of task for description
        
    Returns:
        True if successful, False otherwise
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return False
    
    if user.credits < amount:
        return False
    
    # Get current balance before deducting credits
    opening_balance = user.credits
    
    # Deduct credits
    user.credits -= amount
    closing_balance = user.credits
    
    # Create statement history entry
    statement = StatementHistory(
        user_id=user_id,
        username=user.name,
        email=user.email,
        credit=0.0,
        debit=amount,
        purchase_amount=0.0,
        opening_balance=opening_balance,
        closing_balance=closing_balance,
        transaction_type="usage",
        description=f"Credits used for {task_type}"
    )
    
    db.add(statement)
    db.commit()
    
    return True

def add_credits(db: Session, user_id: int, amount: float, method: str, payment_id: Optional[str] = None) -> bool:
    """
    Add credits to a user's account and record the transaction.
    
    Args:
        db: Database session
        user_id: User ID
        amount: Amount of credits to add
        method: Payment method (e.g., "stripe", "razorpay")
        payment_id: Payment ID from the payment provider
        
    Returns:
        True if successful, False otherwise
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return False
    
    # Get current balance before adding credits
    opening_balance = user.credits
    
    # Add credits to user account
    user.credits += amount
    closing_balance = user.credits
    
    # Record the transaction
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        method=method,
        payment_id=payment_id,
        status="completed"
    )
    
    db.add(transaction)
    db.flush()  # Flush to get the transaction ID
    
    # Create statement history entry
    statement = StatementHistory(
        user_id=user_id,
        username=user.name,
        email=user.email,
        credit=amount,
        debit=0.0,
        purchase_amount=amount,
        opening_balance=opening_balance,
        closing_balance=closing_balance,
        transaction_type="purchase",
        description=f"Credit purchase via {method}",
        reference_id=transaction.id
    )
    
    db.add(statement)
    db.commit()
    
    return True

def get_user_credit_balance(db: Session, user_id: int) -> Optional[float]:
    """
    Get a user's credit balance.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        Credit balance or None if user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return None
    
    return user.credits

def update_user_credits(db: Session, user_id: int, amount: float) -> bool:
    """
    Update a user's credit balance by adding or subtracting the specified amount.
    
    Args:
        db: Database session
        user_id: User ID
        amount: Amount to add (positive) or subtract (negative)
        
    Returns:
        True if successful, False otherwise
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return False
    
    # Update the user's credits
    user.credits += amount
    
    # Ensure credits don't go below zero
    if user.credits < 0:
        user.credits = 0
    
    # No need to commit here as it will be committed by the caller
    return True
