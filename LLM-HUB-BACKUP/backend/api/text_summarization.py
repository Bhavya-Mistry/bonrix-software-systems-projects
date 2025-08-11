from fastapi import APIRouter, Depends, HTTPException, Form, status
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
    prefix="/api/text-summarization",
    tags=["Text Summarization"]
)

@router.post("/summarize")
async def summarize_text(
    text: str = Form(...),
    model: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has enough credits
    estimated_tokens = estimate_token_usage("text_summarization", len(text))
    estimated_cost = estimated_tokens * 0.001  # Example: 1 credit per 1000 tokens
    
    if current_user.credits < estimated_cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits"
        )
    
    try:
        # Get the appropriate LLM service
        llm_service = get_llm_service(model)
        
        # Start timing
        start_time = time.time()
        
        # Generate summary
        result = llm_service.summarize_text(text)
        
        # Calculate time taken
        time_taken = time.time() - start_time
        
        # Calculate actual token usage and cost
        tokens_used = result.get("tokens_used", estimated_tokens)
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
            task_type="text_summarization",
            model_used=model,
            tokens_used=tokens_used,
            credit_cost=credit_cost,
            result_json=result
        )
        
        db.add(task_log)
        db.commit()
        
        # Format the response
        response = {
            "task": "Text Summarization",
            "model": model,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": result.get("summary", ""),
                "structured_data": {
                    "key_points": result.get("key_points", []),
                    "original_length": len(text),
                    "summary_length": len(result.get("summary", "")),
                    "compression_ratio": len(result.get("summary", "")) / max(len(text), 1) * 100
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error summarizing text: {str(e)}"
        )
