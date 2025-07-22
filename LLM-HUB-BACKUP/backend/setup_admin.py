import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.database import Base, User
from utils.auth import get_password_hash
import getpass

# Import database URL from utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils.database import DATABASE_URL

def setup_admin():
    """Set up a superadmin user for the admin dashboard."""
    print("Setting up superadmin user for LLM Hub Admin Dashboard")
    print("=" * 60)
    
    # Create database engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Check if there's already an admin user
    existing_admin = db.query(User).filter(User.is_admin == 1).first()
    if existing_admin:
        print(f"An admin user already exists: {existing_admin.email}")
        print("Do you want to create another admin user? (y/n)")
        choice = input().lower()
        if choice != 'y':
            print("Setup cancelled.")
            return
    
    # Get admin details
    print("\nEnter admin user details:")
    name = input("Name: ")
    email = input("Email: ")
    password = getpass.getpass("Password (min 6 characters): ")
    
    if len(password) < 6:
        print("Password must be at least 6 characters long.")
        return
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    
    if existing_user:
        print(f"User with email {email} already exists.")
        print("Do you want to promote this user to admin? (y/n)")
        choice = input().lower()
        
        if choice == 'y':
            existing_user.is_admin = 1
            db.commit()
            print(f"User {email} has been promoted to admin.")
        else:
            print("Setup cancelled.")
        
        return
    
    # Create new admin user
    hashed_password = get_password_hash(password)
    new_admin = User(
        name=name,
        email=email,
        password_hash=hashed_password,
        credits=1000.0,  # Give admin some credits
        is_admin=1  # Set as admin
    )
    
    db.add(new_admin)
    db.commit()
    
    print("\nAdmin user created successfully!")
    print(f"Email: {email}")
    print("You can now log in to the admin dashboard at /admin-login")

if __name__ == "__main__":
    setup_admin()
