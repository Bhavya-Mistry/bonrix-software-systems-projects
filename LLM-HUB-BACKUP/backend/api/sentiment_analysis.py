from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import time

from utils.database import get_db
from utils.auth import get_current_user
from models.database import User, TaskLog
from services.llm_service import get_llm_service
from services.credit_service import deduct_credits, estimate_token_usage

router = APIRouter(
    prefix="/api/sentiment-analysis",
    tags=["Sentiment Analysis"]
)

@router.post("/analyze")
async def analyze_sentiment(
    reviews: str = Form(...),
    model: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has enough credits
    estimated_tokens = estimate_token_usage("sentiment_analysis", len(reviews))
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
        
        # Analyze sentiment
        result = llm_service.analyze_sentiment(reviews)
        
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
            task_type="sentiment_analysis",
            model_used=model,
            tokens_used=tokens_used,
            credit_cost=credit_cost,
            result_json=result
        )
        
        db.add(task_log)
        db.commit()
        
        # Format the response
        response = {
            "task": "Sentiment Analysis",
            "model": model,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": f"Overall sentiment: {result.get('overall_sentiment', 'Neutral')}",
                "structured_data": {
                    "overall_sentiment": result.get("overall_sentiment", "Neutral"),
                    "sentiment_breakdown": {
                        "positive": result.get("positive_percentage", 0),
                        "neutral": result.get("neutral_percentage", 0),
                        "negative": result.get("negative_percentage", 0)
                    },
                    "reviews_analyzed": result.get("reviews_analyzed", [])
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing sentiment: {str(e)}"
        )
