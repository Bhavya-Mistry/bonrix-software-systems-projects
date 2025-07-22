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
from services.vision_service import detect_objects

router = APIRouter(
    prefix="/api/object-detection",
    tags=["Object Detection"]
)

@router.post("/detect")
async def detect_objects_in_image(
    image_file: UploadFile = File(...),
    model: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has enough credits
    estimated_tokens = estimate_token_usage("object_detection")
    estimated_cost = estimated_tokens * 0.001  # Example: 1 credit per 1000 tokens
    
    if current_user.credits < estimated_cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits"
        )
    
    # Read the image file
    image_content = await image_file.read()
    
    try:
        # Start timing
        start_time = time.time()
        
        # Process the image with YOLOv8
        detection_result = detect_objects(image_content)
        
        # Get the appropriate LLM service for captioning
        llm_service = get_llm_service(model)
        
        # Generate caption using LLM
        caption_result = llm_service.generate_image_caption(detection_result)
        
        # Combine results
        result = {
            "objects": detection_result["objects"],
            "counts": detection_result["counts"],
            "caption": caption_result["caption"]
        }
        
        # Calculate time taken
        time_taken = time.time() - start_time
        
        # Calculate actual token usage and cost
        tokens_used = caption_result.get("tokens_used", estimated_tokens)
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
            task_type="object_detection",
            model_used=model,
            tokens_used=tokens_used,
            credit_cost=credit_cost,
            result_json=result
        )
        
        db.add(task_log)
        db.commit()
        
        # Format the response
        response = {
            "task": "Object Detection",
            "model": model,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": caption_result["caption"],
                "structured_data": {
                    "objects": detection_result["objects"],
                    "counts": detection_result["counts"]
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )
