"""
LLM Hub Admin Dashboard Setup Script
-----------------------------------
This script sets up the Admin Dashboard by:
1. Running the database migrations
2. Creating an admin user
3. Setting up initial platform settings
"""

import os
import sys
import subprocess
import getpass
from pathlib import Path

# Get the project root directory
ROOT_DIR = Path(__file__).parent.absolute()
BACKEND_DIR = ROOT_DIR / "backend"
MIGRATIONS_DIR = BACKEND_DIR / "migrations"

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f" {text} ".center(80, "="))
    print("=" * 80 + "\n")

def run_migrations():
    """Run the database migrations."""
    print_header("RUNNING DATABASE MIGRATIONS")
    
    try:
        # Change to the backend directory
        os.chdir(BACKEND_DIR)
        
        # Run the Alembic migration
        subprocess.run([
            sys.executable, 
            "-c", 
            "from alembic import command; from alembic.config import Config; "
            "alembic_cfg = Config('alembic.ini'); command.upgrade(alembic_cfg, 'head')"
        ], check=True)
        
        print("\n✅ Database migrations completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running migrations: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

def create_admin_user():
    """Create an admin user."""
    print_header("CREATING ADMIN USER")
    
    try:
        # Change to the backend directory
        os.chdir(BACKEND_DIR)
        
        # Run the setup_admin.py script
        subprocess.run([sys.executable, "setup_admin.py"], check=True)
        
        print("\n✅ Admin user setup completed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error setting up admin user: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

def start_servers():
    """Start the backend and frontend servers."""
    print_header("STARTING SERVERS")
    
    print("Starting backend server...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload"], 
        cwd=BACKEND_DIR
    )
    
    print("\nStarting frontend server...")
    frontend_process = subprocess.Popen(
        ["npm", "start"], 
        cwd=ROOT_DIR / "frontend"
    )
    
    print("\n✅ Servers started successfully!")
    print("\nBackend server running at: http://localhost:8000")
    print("Frontend server running at: http://localhost:3000")
    print("\nAdmin Dashboard available at: http://localhost:3000/admin-login")
    print("\nPress Ctrl+C to stop the servers.")
    
    try:
        # Keep the script running until interrupted
        backend_process.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Servers stopped.")

def main():
    """Main function to run the setup process."""
    print_header("LLM HUB ADMIN DASHBOARD SETUP")
    
    print("This script will set up the Admin Dashboard by:")
    print("1. Running the database migrations")
    print("2. Creating an admin user")
    print("3. Starting the backend and frontend servers")
    
    proceed = input("\nDo you want to proceed? (y/n): ").lower()
    if proceed != 'y':
        print("Setup cancelled.")
        return
    
    # Run migrations
    if not run_migrations():
        print("Setup failed at migration step.")
        return
    
    # Create admin user
    if not create_admin_user():
        print("Setup failed at admin user creation step.")
        return
    
    # Ask if user wants to start servers
    start_servers_prompt = input("\nDo you want to start the servers now? (y/n): ").lower()
    if start_servers_prompt == 'y':
        start_servers()
    else:
        print("\n✅ Setup completed successfully!")
        print("\nTo start the servers manually:")
        print("1. Start backend: cd backend && python -m uvicorn main:app --reload")
        print("2. Start frontend: cd frontend && npm start")
        print("\nAdmin Dashboard will be available at: http://localhost:3000/admin-login")

if __name__ == "__main__":
    main()
