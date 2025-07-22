from fastapi import APIRouter, Depends, HTTPException, Form, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import json

from utils.database import get_db
from utils.auth import get_current_user
from models.database import User, Transaction
from services.payment_service import (
    get_credit_packages,
    create_stripe_payment_intent,
    verify_stripe_payment,
    create_razorpay_order,
    verify_razorpay_payment
)
from services.credit_service import add_credits

router = APIRouter(
    prefix="/api/payment",
    tags=["Payment"]
)

@router.get("/packages")
async def get_packages():
    """Get available credit packages."""
    packages = get_credit_packages()
    return packages

@router.post("/stripe/create-intent")
async def create_stripe_intent(
    package_id: str = Form(...),
    currency: str = Form("inr"),
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe payment intent."""
    try:
        intent = create_stripe_payment_intent(package_id, currency)
        return intent
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/stripe/verify")
async def verify_stripe_intent(
    payment_intent_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify a Stripe payment and add credits to the user's account."""
    try:
        verification = verify_stripe_payment(payment_intent_id)
        
        if verification["success"]:
            # Add credits to the user's account
            credits_to_add = float(verification["credits"])
            add_credits(
                db,
                current_user.id,
                credits_to_add,
                "stripe",
                payment_intent_id
            )
            
            return {
                "success": True,
                "message": f"Added {credits_to_add} credits to your account",
                "credits_added": credits_to_add,
                "new_balance": current_user.credits + credits_to_add
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment verification failed: {verification['status']}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/razorpay/create-order")
async def create_razorpay_payment(
    package_id: str = Form(...),
    currency: str = Form("INR"),
    current_user: User = Depends(get_current_user)
):
    """Create a Razorpay order."""
    try:
        order = create_razorpay_order(package_id, currency)
        return order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/razorpay/verify")
async def verify_razorpay_payment_endpoint(
    payment_id: str = Form(...),
    order_id: str = Form(...),
    signature: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify a Razorpay payment and add credits to the user's account."""
    try:
        verification = verify_razorpay_payment(payment_id, order_id, signature)
        
        if verification["success"]:
            # Add credits to the user's account
            credits_to_add = float(verification["credits"])
            add_credits(
                db,
                current_user.id,
                credits_to_add,
                "razorpay",
                payment_id
            )
            
            return {
                "success": True,
                "message": f"Added {credits_to_add} credits to your account",
                "credits_added": credits_to_add,
                "new_balance": current_user.credits + credits_to_add
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment verification failed: {verification.get('error', 'Unknown error')}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
