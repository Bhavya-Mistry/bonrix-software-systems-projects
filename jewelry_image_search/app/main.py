import os, io, sqlite3, base64, requests, mimetypes, tempfile
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from PIL import Image
import torch
from retriever.models import load_model
from retriever.embed import embed_image_pil, embed_text
from retriever.index import load_index, read_id_map, search

# Gemini imports
from google import genai
from google.genai import types

app = FastAPI(title="Jewelry Image Search", version="0.1.0")

# --- Constants and Configuration ---
IDX_PATH = "data/faiss.index"
MAP_PATH = "data/id_map.csv"
DB_PATH  = "data/products.sqlite"

# Gemini API Configuration
GOOGLE_GENAI_API_KEY = "AIzaSyDVwkLbC2az9dzwAIqYeIh-WDq1pWAqwhw"

# --- Model and Index Loading ---
model, _ ,device, _ = load_model()
if not (os.path.exists(IDX_PATH) and os.path.exists(MAP_PATH)):
    raise RuntimeError("Index not found. Run: python jobs/build_index.py")
index = load_index(IDX_PATH)
id_map = read_id_map(MAP_PATH)

# --- Static File Mounting ---
app.mount("/static", StaticFiles(directory="frontend"), name="static")
app.mount("/images", StaticFiles(directory="data/images"), name="images")

# --- Pydantic Models ---
class Hit(BaseModel):
    rank: int
    match_percent: float
    cosine: float
    image_path: str
    sku: Optional[str] = None
    title: Optional[str] = None

# --- Helper Functions ---
def attach_metadata(hits: List[dict]) -> List[Hit]:
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    enriched = []
    
    for h in hits:
        original_path = h['image_path']
        normalized_path = original_path.replace('\\', '/')
        normalized_hit = h.copy()
        normalized_hit['image_path'] = normalized_path
        
        cur.execute("SELECT sku, title FROM products WHERE image_path = ? LIMIT 1", (original_path,))
        row = cur.fetchone()
        
        if row:
            sku, title = row
            enriched.append(Hit(**normalized_hit, sku=sku, title=title))
        else:
            cur.execute("SELECT sku, title FROM products WHERE image_path = ? LIMIT 1", (normalized_path,))
            row = cur.fetchone()
            if row:
                sku, title = row
                enriched.append(Hit(**normalized_hit, sku=sku, title=title))
            else:
                filename = os.path.basename(original_path)
                cur.execute("SELECT sku, title FROM products WHERE image_path LIKE ? LIMIT 1", (f'%{filename}',))
                row = cur.fetchone()
                if row:
                    sku, title = row
                    enriched.append(Hit(**normalized_hit, sku=sku, title=title))
                else:
                    enriched.append(Hit(**normalized_hit))
    con.close()
    return enriched

def part_from_image_path(image_path: str) -> types.Part:
    """Create a Gemini Part from an image file path."""
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type or not mime_type.startswith("image/"):
        raise ValueError(f"Could not determine image mime type for: {image_path}")
    with open(image_path, "rb") as f:
        data = f.read()
    return types.Part.from_bytes(mime_type=mime_type, data=data)

def process_with_gemini(image_path: str) -> bytes:
    """Process image with Gemini API and return the generated image bytes."""
    if not GOOGLE_GENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    client = genai.Client(api_key=GOOGLE_GENAI_API_KEY)
    model_name = "gemini-2.0-flash-preview-image-generation"
    
    # Use the exact prompt from your provided code
    prompt = ("Please analyze the attached image. First, identify the primary object of attention "
              "or the main subject in this photo. Based on your analysis, generate a new image that "
              "is a close-up crop of only that object. The final generated image should have the "
              "object placed on a clean, plain white background. Make sure the image does not get changed.")
    
    # Construct contents with both text and image parts
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
                part_from_image_path(image_path),
            ],
        ),
    ]
    
    # Configure to request image response
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"]
    )
    
    try:
        print(f"Processing image with Gemini: {image_path}")
        
        # Generate content using streaming
        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            # Skip empty chunks
            if (not chunk.candidates or not chunk.candidates[0].content or 
                not chunk.candidates[0].content.parts):
                continue
            
            for part in chunk.candidates[0].content.parts:
                # Check for image data
                if (getattr(part, "inline_data", None) and 
                    getattr(part.inline_data, "data", None)):
                    
                    data_buffer = part.inline_data.data
                    print("Received image data from Gemini")
                    
                    # Convert base64 string to bytes if needed
                    if isinstance(data_buffer, str):
                        try:
                            return base64.b64decode(data_buffer)
                        except Exception as e:
                            print(f"Error decoding base64: {e}")
                            raise HTTPException(status_code=500, 
                                              detail="Failed to decode generated image")
                    return data_buffer
                
                # Log any text responses
                if getattr(part, "text", None):
                    print(f"Gemini response text: {part.text}")
        
        # If no image was returned
        print("No image generated by Gemini")
        raise HTTPException(status_code=500, detail="No image generated by Gemini")
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini processing failed: {str(e)}")

# --- FastAPI Endpoints ---
@app.get("/")
def read_index():
    return FileResponse('frontend/index.html')

@app.post("/search/image", response_model=List[Hit])
async def search_image(file: UploadFile = File(...), top_k: int = 8, min_percent: float = 80.0):
    pil = Image.open(io.BytesIO(await file.read())).convert("RGB")
    qvec = embed_image_pil(pil, model, device)
    hits = search(index, qvec, id_map, top_k=top_k, min_percent=min_percent)
    return attach_metadata(hits)

@app.post("/search/text", response_model=List[Hit])
async def search_text(query: str = Form(...), top_k: int = Form(8), min_percent: float = Form(70.0)):
    qvec = embed_text(query, model, device)
    hits = search(index, qvec, id_map, top_k=top_k, min_percent=min_percent)
    return attach_metadata(hits)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "index_size": len(id_map)}

@app.post("/chatgpt")
async def preprocess_chatgpt(file: UploadFile = File(...)):
    content = await file.read()
    return Response(content=content, media_type=file.content_type)

@app.post("/gemini")
async def preprocess_gemini(file: UploadFile = File(...)):
    """Process image with Gemini AI - crop main object and place on white background."""
    try:
        print("Gemini endpoint called")
        
        # Read the uploaded file
        file_content = await file.read()
        print(f"Received file: {file.filename}, size: {len(file_content)} bytes")
        
        # Create a temporary file to save the uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
            print(f"Saved temp file: {temp_file_path}")
        
        try:
            # Process with Gemini API
            print("Calling Gemini API...")
            processed_image_bytes = process_with_gemini(temp_file_path)
            print(f"Received processed image: {len(processed_image_bytes)} bytes")
            
            # Return the processed image
            return Response(
                content=processed_image_bytes,
                media_type="image/jpeg",
                headers={
                    "Content-Disposition": "inline; filename=gemini_processed.jpg"
                }
            )
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
                print(f"Cleaned up temp file: {temp_file_path}")
            except OSError as e:
                print(f"Error cleaning up temp file: {e}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in Gemini preprocessing: {e}")
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@app.post("/bgremover")
async def preprocess_bgremover(file: UploadFile = File(...)):
    content = await file.read()
    # This would be a good place for a dedicated background removal library if needed
    return Response(content=content, media_type=file.content_type)

@app.post("/quin")
async def preprocess_quin(file: UploadFile = File(...)):
    content = await file.read()
    return Response(content=content, media_type=file.content_type)

@app.post("/nanobanana")
async def preprocess_nanobanana(file: UploadFile = File(...)):
    content = await file.read()
    return Response(content=content, media_type=file.content_type)