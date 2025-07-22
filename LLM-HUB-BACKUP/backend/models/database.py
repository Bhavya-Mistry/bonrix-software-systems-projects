from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

# Function to get current time in IST (UTC+5:30)
def get_ist_time():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    credits = Column(Float, default=0.0)
    is_admin = Column(Integer, default=0)  # 0 = regular user, 1 = admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    task_logs = relationship("TaskLog", back_populates="user")
    statements = relationship("StatementHistory", backref="user_account")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)  # Amount in credits
    method = Column(String, nullable=False)  # "stripe", "razorpay", etc.
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Additional fields for payment tracking
    payment_id = Column(String, nullable=True)
    status = Column(String, default="completed")
    
    # Relationships
    user = relationship("User", back_populates="transactions")

class TaskLog(Base):
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_type = Column(String, nullable=False)  # "resume_analysis", "object_detection", etc.
    model_used = Column(String, nullable=False)  # "gpt-4", "mistral-7b", etc.
    tokens_used = Column(Integer, nullable=False)
    credit_cost = Column(Float, nullable=False)
    result_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=get_ist_time)
    
    # Relationships
    user = relationship("User", back_populates="task_logs")

class ModelConfig(Base):
    __tablename__ = "model_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False, unique=True)  # "gpt-4", "mistral-7b", etc.
    is_active = Column(Integer, default=1)  # 0 = disabled, 1 = enabled
    token_cost_multiplier = Column(Float, default=1.0)  # Cost multiplier for tokens
    description = Column(String, nullable=True)
    provider = Column(String, nullable=False)  # "openai", "mistral", "groq", etc.
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CreditPackage(Base):
    __tablename__ = "credit_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    credits = Column(Float, nullable=False)  # Number of credits in the package
    price_inr = Column(Float, nullable=False)  # Price in INR (₹)
    price_usd = Column(Float, nullable=False)  # Price in USD ($)
    is_active = Column(Integer, default=1)  # 0 = disabled, 1 = enabled
    is_promotional = Column(Integer, default=0)  # 0 = regular, 1 = promotional
    discount_percentage = Column(Float, default=0.0)  # Discount percentage
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    log_type = Column(String, nullable=False)  # "error", "warning", "info"
    source = Column(String, nullable=False)  # "payment", "model_api", "credit_system", etc.
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional user association
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="system_logs")

class PlatformSettings(Base):
    __tablename__ = "platform_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, nullable=False, unique=True)  # Setting key
    value = Column(Text, nullable=True)  # Setting value
    description = Column(String, nullable=True)  # Description of the setting
    is_secure = Column(Integer, default=0)  # 0 = regular setting, 1 = secure setting (API keys, etc.)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who last updated
    
    # Relationship
    admin = relationship("User")

class StatementHistory(Base):
    __tablename__ = "statement_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    credit = Column(Float, default=0.0)  # Amount credited
    debit = Column(Float, default=0.0)   # Amount debited
    purchase_amount = Column(Float, default=0.0)  # Purchase amount if applicable
    opening_balance = Column(Float, nullable=False)  # Balance before transaction
    closing_balance = Column(Float, nullable=False)  # Balance after transaction
    transaction_type = Column(String, nullable=False)  # "purchase", "usage", "refund", "admin_adjustment"
    description = Column(String, nullable=True)  # Additional details
    reference_id = Column(Integer, nullable=True)  # Reference to transaction or task_log if applicable
    timestamp = Column(DateTime, default=get_ist_time)
    
    # Relationship
    user = relationship("User")
