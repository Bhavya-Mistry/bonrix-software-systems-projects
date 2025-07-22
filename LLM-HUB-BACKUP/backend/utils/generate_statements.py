from sqlalchemy.orm import Session
from models.database import User, Transaction, TaskLog, StatementHistory
from utils.database import get_db

def generate_statement_history():
    """
    Generate a complete statement history based on existing transactions and task logs
    This is useful for initial setup or when migrating from an older version
    """
    # Get database session
    db = next(get_db())
    
    try:
        # Clear existing statements (optional - comment out if you want to keep existing statements)
        print("Clearing existing statement history...")
        db.query(StatementHistory).delete()
        
        # Get all users
        print("Fetching all users...")
        users = db.query(User).all()
        print(f"Found {len(users)} users")
        
        for user in users:
            print(f"Processing user: {user.name} (ID: {user.id})")
            
            # Get all transactions for this user
            transactions = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.timestamp).all()
            print(f"  Found {len(transactions)} transactions")
            
            # Get all task logs for this user
            task_logs = db.query(TaskLog).filter(TaskLog.user_id == user.id).order_by(TaskLog.timestamp).all()
            print(f"  Found {len(task_logs)} task logs")
            
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
        print("Committing changes to database...")
        db.commit()
        print("Statement history generated successfully for all users")
        
    except Exception as e:
        print(f"Error generating statement history: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    generate_statement_history()
