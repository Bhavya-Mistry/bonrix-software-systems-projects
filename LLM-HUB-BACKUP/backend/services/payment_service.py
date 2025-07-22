import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Load API keys from environment variables
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Mock payment clients for development
stripe_available = False
razorpay_available = False

try:
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    stripe_available = True
except ImportError:
    print("Stripe module not available. Using mock implementation.")

try:
    import razorpay
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    razorpay_available = True
except ImportError:
    print("Razorpay module not available. Using mock implementation.")

# Credit package options
CREDIT_PACKAGES = [
    {"id": "basic", "credits": 100, "price_inr": 100, "price_usd": 1.2},
    {"id": "standard", "credits": 500, "price_inr": 450, "price_usd": 5.5},
    {"id": "premium", "credits": 1000, "price_inr": 800, "price_usd": 10},
    {"id": "enterprise", "credits": 5000, "price_inr": 3500, "price_usd": 42}
]

def get_credit_packages() -> list:
    """
    Get available credit packages.
    
    Returns:
        List of credit packages
    """
    return CREDIT_PACKAGES

def create_stripe_payment_intent(package_id: str, currency: str = "inr") -> Dict[str, Any]:
    """
    Create a Stripe payment intent.
    
    Args:
        package_id: ID of the credit package
        currency: Currency code (default: inr)
        
    Returns:
        Payment intent details
    """
    # Find the package
    package = next((p for p in CREDIT_PACKAGES if p["id"] == package_id), None)
    
    if not package:
        raise ValueError(f"Invalid package ID: {package_id}")
    
    # Get the price based on currency
    amount = package["price_inr"] if currency.lower() == "inr" else package["price_usd"]
    
    # Convert to smallest currency unit (paise for INR, cents for USD)
    amount_in_smallest_unit = int(amount * 100)
    
    if not stripe_available:
        # Mock implementation for development
        import uuid
        mock_intent_id = f"pi_mock_{uuid.uuid4().hex[:16]}"
        mock_client_secret = f"pi_mock_{uuid.uuid4().hex[:24]}_secret_{uuid.uuid4().hex[:16]}"
        
        return {
            "client_secret": mock_client_secret,
            "payment_id": mock_intent_id,
            "amount": amount,
            "currency": currency,
            "credits": package["credits"],
            "mock": True
        }
    
    try:
        # Create a payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount_in_smallest_unit,
            currency=currency.lower(),
            metadata={
                "package_id": package_id,
                "credits": package["credits"]
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_id": intent.id,
            "amount": amount,
            "currency": currency,
            "credits": package["credits"]
        }
    except Exception as e:
        raise Exception(f"Error creating Stripe payment intent: {str(e)}")

def verify_stripe_payment(payment_intent_id: str) -> Dict[str, Any]:
    """
    Verify a Stripe payment.
    
    Args:
        payment_intent_id: Stripe payment intent ID
        
    Returns:
        Payment verification result
    """
    if not stripe_available or payment_intent_id.startswith("pi_mock_"):
        # Mock implementation for development
        # Always return success for mock payments
        package = CREDIT_PACKAGES[0]  # Use the first package as default
        return {
            "success": True,
            "payment_id": payment_intent_id,
            "amount": package["price_inr"],
            "currency": "inr",
            "credits": package["credits"],
            "status": "succeeded",
            "mock": True
        }
    
    try:
        # Retrieve the payment intent
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Check if the payment is successful
        if intent.status == "succeeded":
            return {
                "success": True,
                "payment_id": payment_intent_id,
                "amount": intent.amount / 100,  # Convert from smallest unit
                "currency": intent.currency,
                "credits": intent.metadata.get("credits", 0),
                "status": intent.status
            }
        else:
            return {
                "success": False,
                "payment_id": payment_intent_id,
                "status": intent.status
            }
    except Exception as e:
        raise Exception(f"Error verifying Stripe payment: {str(e)}")

def create_razorpay_order(package_id: str, currency: str = "INR") -> Dict[str, Any]:
    """
    Create a Razorpay order.
    
    Args:
        package_id: ID of the credit package
        currency: Currency code (default: INR)
        
    Returns:
        Order details
    """
    # Find the package
    package = next((p for p in CREDIT_PACKAGES if p["id"] == package_id), None)
    
    if not package:
        raise ValueError(f"Invalid package ID: {package_id}")
    
    # Get the price based on currency
    amount = package["price_inr"] if currency.upper() == "INR" else package["price_usd"]
    
    # Convert to smallest currency unit (paise for INR, cents for USD)
    amount_in_smallest_unit = int(amount * 100)
    
    if not razorpay_available:
        # Mock implementation for development
        import uuid
        mock_order_id = f"order_mock_{uuid.uuid4().hex[:16]}"
        
        return {
            "order_id": mock_order_id,
            "amount": amount,
            "currency": currency,
            "credits": package["credits"],
            "mock": True
        }
    
    try:
        # Create an order
        order_data = {
            "amount": amount_in_smallest_unit,
            "currency": currency,
            "notes": {
                "package_id": package_id,
                "credits": package["credits"]
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return {
            "order_id": order["id"],
            "amount": amount,
            "currency": currency,
            "credits": package["credits"]
        }
    except Exception as e:
        raise Exception(f"Error creating Razorpay order: {str(e)}")

def verify_razorpay_payment(payment_id: str, order_id: str, signature: str) -> Dict[str, Any]:
    """
    Verify a Razorpay payment.
    
    Args:
        payment_id: Razorpay payment ID
        order_id: Razorpay order ID
        signature: Razorpay signature
        
    Returns:
        Payment verification result
    """
    if not razorpay_available or order_id.startswith("order_mock_"):
        # Mock implementation for development
        # Always return success for mock payments
        package = CREDIT_PACKAGES[0]  # Use the first package as default
        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": package["price_inr"],
            "currency": "INR",
            "credits": package["credits"],
            "status": "succeeded",
            "mock": True
        }
    
    try:
        # Create the data to verify
        params_dict = {
            "razorpay_payment_id": payment_id,
            "razorpay_order_id": order_id,
            "razorpay_signature": signature
        }
        
        # Verify the payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Get the order details
        order = razorpay_client.order.fetch(order_id)
        
        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": order["amount"] / 100,  # Convert from smallest unit
            "currency": order["currency"],
            "credits": order["notes"].get("credits", 0),
            "status": "succeeded"
        }
    except Exception as e:
        return {
            "success": False,
            "payment_id": payment_id,
            "order_id": order_id,
            "status": "failed",
            "error": str(e)
        }
