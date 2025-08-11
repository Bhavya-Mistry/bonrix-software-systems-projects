import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
import json
import time

from utils.database import get_db
from utils.auth import get_current_user
from models.database import User, TaskLog
from services.llm_service import get_llm_service
from services.credit_service import deduct_credits, estimate_token_usage


router = APIRouter(
    prefix="/api/invoice-extraction",
    tags=["Invoice Extraction"]
)

@router.post("/extract")
async def extract_invoice_data(
    file: UploadFile = File(...),
    model: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has enough credits
    estimated_tokens = estimate_token_usage("invoice_extraction")
    estimated_cost = estimated_tokens * 0.001  # Example: 1 credit per 1000 tokens
    
    if current_user.credits < estimated_cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits"
        )
    
    # Read the file
    file_content = await file.read()
    
    try:
        # Start timing
        start_time = time.time()
        
        # Use Gemini's multimodal API to analyze the invoice image directly
        llm_service = get_llm_service(model)
        if hasattr(llm_service, "analyze_image"):
            parsed_result = llm_service.analyze_image(file_content)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected model does not support direct image analysis. Please use a Gemini model."
            )
        
        # Calculate time taken
        time_taken = time.time() - start_time
        
        # Calculate actual token usage and cost
        tokens_used = parsed_result.get("tokens_used", estimated_tokens)
        credit_cost = tokens_used * 0.001  # Same rate as estimation
        
        # Deduct credits - check if successful
        if not deduct_credits(db, current_user.id, credit_cost):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. This task requires {credit_cost:.2f} credits but you only have {current_user.credits:.2f} credits available."
            )
        
        # Log the task
        task_log = TaskLog(
            user_id=current_user.id,
            task_type="invoice_extraction",
            model_used=model,
            tokens_used=tokens_used,
            credit_cost=credit_cost,
            result_json=parsed_result
        )
        
        db.add(task_log)
        db.commit()
        
        # Format the response
        response = {
            "task": "Invoice Extraction",
            "model": model,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": f"Successfully extracted {len(parsed_result.get('fields', {}))} fields from invoice",
                "structured_data": {
                    "gstin": parsed_result.get("fields", {}).get("gstin", ""),
                    "invoice_no": parsed_result.get("fields", {}).get("invoice_no", ""),
                    "date": parsed_result.get("fields", {}).get("date", ""),
                    "amount": parsed_result.get("fields", {}).get("amount", ""),
                    "vendor": parsed_result.get("fields", {}).get("vendor", ""),
                    "all_fields": parsed_result.get("fields", {})
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing invoice: {str(e)}"
        )
