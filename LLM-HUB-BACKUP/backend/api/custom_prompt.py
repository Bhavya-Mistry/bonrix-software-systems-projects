from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
from typing import Optional
import json
import time
import os
import requests

from utils.database import get_db
from utils.auth import get_current_user
from models.database import User, TaskLog
from services.llm_service import get_llm_service
from services.credit_service import deduct_credits, estimate_token_usage

router = APIRouter(
    prefix="/api/custom-prompt",
    tags=["Custom Prompt"]
)

@router.post("/execute")
async def execute_custom_prompt(
    prompt: str = Form(...),
    model: str = Form(...),
    deep_search: bool = Form(False),
    location: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Deep search option: fetch dealer contact details
    if deep_search:
        serpapi_key = os.getenv("SERPAPI_KEY")
        if not serpapi_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SERPAPI_KEY not configured in environment"
            )
        # Perform local business search
        # Build search parameters
        start_time = time.time()
        params = {
            "engine": "google",
            "q": prompt,
            "tbm": "lcl",
            "api_key": serpapi_key,
            "gl": "cn",
            "hl": "en"
        }
        if location:
            params["location"] = location
        resp = requests.get(
            "https://serpapi.com/search",
            params=params
        )
        data = resp.json()
        time_taken = time.time() - start_time
        # Extract top 5 local results with contact info
        entries = data.get("local_results", []) or data.get("results", [])
        dealers = []
        for item in entries[:5]:
            dealers.append({
                "name": item.get("title") or item.get("name"),
                "address": item.get("address"),
                "phone": item.get("phone"),
                "website": item.get("website")
            })
        # Estimate and deduct credits for deep search (higher rate)
        estimated_tokens = estimate_token_usage("deep_search", len(prompt))
        multiplier = 2.0  # Deep search costs twice the normal rate
        credit_cost = estimated_tokens * 0.001 * multiplier
        if current_user.credits < credit_cost:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits for deep search. This task requires {credit_cost:.2f} credits but you have {current_user.credits:.2f}."
            )
        if not deduct_credits(db, current_user.id, credit_cost):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Unable to deduct credits. Required: {credit_cost:.2f}, Available: {current_user.credits:.2f}."
            )
        # Log the deep search task
        task_log = TaskLog(
            user_id=current_user.id,
            task_type="deep_search",
            model_used=model,
            tokens_used=estimated_tokens,
            credit_cost=credit_cost,
            result_json={"results": dealers, "full_response": data}
        )
        db.add(task_log)
        db.commit()
        # Build summary
        if not dealers:
            summary = f"No dealer contacts found for '{prompt}'. Please refine your query."
        else:
            summary = f"Contact details for top {len(dealers)} dealers of '{prompt}'"
        # Return response with credits used
        return {
            "task": "Deep Search",
            "model": model,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": summary,
                "structured_data": {
                    "results": dealers,
                    "full_response": data
                }
            }
        }
    # Check if user has enough credits
    estimated_tokens = estimate_token_usage("custom_prompt", len(prompt))
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
        
        # Execute custom prompt
        result = llm_service.execute_prompt(prompt)
        
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
            task_type="custom_prompt",
            model_used=model,
            tokens_used=tokens_used,
            credit_cost=credit_cost,
            result_json=result
        )
        
        db.add(task_log)
        db.commit()
        
        # Format the response
        response = {
            "task": "Custom Prompt",
            "model": model,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": result.get("response", "")[:100] + "..." if len(result.get("response", "")) > 100 else result.get("response", ""),
                "structured_data": {
                    "full_response": result.get("response", ""),
                    "prompt_length": len(prompt),
                    "response_length": len(result.get("response", ""))
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing custom prompt: {str(e)}"
        )
