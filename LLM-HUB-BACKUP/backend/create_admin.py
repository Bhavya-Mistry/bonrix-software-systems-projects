"""
Create Admin User Script
-----------------------
This script adds the is_admin column to the users table if it doesn't exist
and creates an admin user with the specified credentials.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import from project
from utils.database import DATABASE_URL
from models.database import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    """Generate a password hash."""
    return pwd_context.hash(password)

def main():
    print("Creating Admin User for LLM Hub")
    print("=" * 50)
    
    # Create database engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Check if is_admin column exists, if not add it
    try:
        # Try to add the is_admin column if it doesn't exist
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin INTEGER DEFAULT 0"))
            conn.commit()
            print("✅ Added is_admin column to users table")
    except Exception as e:
        print(f"Error adding is_admin column: {e}")
        return
    
    # Admin credentials
    admin_email = "admin@windsurf.ai"
    admin_password = "admin123"  # This is a default password, should be changed after first login
    admin_name = "Admin User"
    
    # Check if admin user already exists
    existing_user = db.query(User).filter(User.email == admin_email).first()
    
    if existing_user:
        # Update existing user to be an admin
        existing_user.is_admin = 1
        db.commit()
        print(f"✅ Updated existing user {admin_email} to be an admin")
    else:
        # Create new admin user
        hashed_password = get_password_hash(admin_password)
        new_admin = User(
            name=admin_name,
            email=admin_email,
            password_hash=hashed_password,
            credits=1000.0,  # Give admin some credits
            is_admin=1  # Set as admin
        )
        
        db.add(new_admin)
        db.commit()
        print(f"✅ Created new admin user: {admin_email}")
    
    print("\n🔐 Admin Login Credentials:")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("\n⚠️ Important: Change this password after your first login!")
    print("\nYou can now log in to the admin dashboard at /admin-login")

if __name__ == "__main__":
    main()
