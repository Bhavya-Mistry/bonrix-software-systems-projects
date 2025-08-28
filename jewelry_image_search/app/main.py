# main.py (MODIFIED FOR HYBRID SEARCH)

import os, io, sqlite3, base64, requests, mimetypes, tempfile
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
# --- ADDED: Import CORSMiddleware ---
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageFilter, ImageEnhance
import torch
from retriever.models import load_model
from retriever.embed import embed_image_pil, embed_text
from retriever.index import load_index, read_id_map, search

# Gemini imports
from google import genai
from google.genai import types

# REMBG import
from rembg import remove

app = FastAPI(title="Jewelry Image Search API", version="0.1.0") # Changed title for clarity

# --- ADDED: CORS Middleware Configuration ---
# This is the most important change.
# Replace "https://your-frontend-domain.com" with the actual domain where you will host index.html
# For local testing, you might use "http://localhost:8000" or "http://127.0.0.1:8000"
# if you serve the HTML file with a simple local server.
origins = [
    # "https://your-frontend-domain.com",
    # "http://your-frontend-domain.com",
    # "http://localhost",
    # "http://localhost:8000",
    # "http://localhost:8080",
    # "http://127.0.0.1",
    # "http://127.0.0.1:8000",
    # "null" # Often needed for local testing with file:// protocol
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)


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
# --- REMOVED: Mounting the frontend directory ---
# app.mount("/static", StaticFiles(directory="frontend"), name="static")

# --- KEPT: Mounting the images directory ---
# This is important because the API search results will return image paths,
# and the frontend will need to fetch them from here.
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
    prompt = ("only keep jewelry item from image, keep jewelry item unedited, keep its shape and color preserved, remove everything else from image and place it on pure whiteÂ background")
    
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
                part_from_image_path(image_path),
            ],
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"]
    )
    
    try:
        print(f"Processing image with Gemini: {image_path}")
        
        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if (not chunk.candidates or not chunk.candidates[0].content or 
                not chunk.candidates[0].content.parts):
                continue
            
            for part in chunk.candidates[0].content.parts:
                if (getattr(part, "inline_data", None) and 
                    getattr(part.inline_data, "data", None)):
                    
                    data_buffer = part.inline_data.data
                    print("Received image data from Gemini")
                    
                    if isinstance(data_buffer, str):
                        try:
                            return base64.b64decode(data_buffer)
                        except Exception as e:
                            print(f"Error decoding base64: {e}")
                            raise HTTPException(status_code=500, 
                                              detail="Failed to decode generated image")
                    return data_buffer
                
                if getattr(part, "text", None):
                    print(f"Gemini response text: {part.text}")
        
        print("No image generated by Gemini")
        raise HTTPException(status_code=500, detail="No image generated by Gemini")
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini processing failed: {str(e)}")

def process_with_rembg(image_path: str) -> bytes:
    """Remove background and create crisp catalog image with white background."""
    try:
        print(f"Processing image with REMBG: {image_path}")
        
        with open(image_path, 'rb') as f:
            input_data = f.read()
        
        print("Removing background...")
        output_data = remove(input_data)
        img_no_bg = Image.open(io.BytesIO(output_data)).convert("RGBA")
        
        print(f"Background removed. Image size: {img_no_bg.size}")
        
        img_no_bg = img_no_bg.filter(ImageFilter.UnsharpMask(radius=1.5, percent=150, threshold=3))
        
        enhancer = ImageEnhance.Contrast(img_no_bg)
        img_no_bg = enhancer.enhance(1.1)
        
        enhancer = ImageEnhance.Color(img_no_bg)
        img_no_bg = enhancer.enhance(1.05)
        
        alpha = img_no_bg.split()[-1]
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        img_no_bg = Image.merge('RGBA', img_no_bg.split()[:3] + (alpha,))
        
        padding = 50
        new_size = (img_no_bg.width + padding*2, img_no_bg.height + padding*2)
        white_bg = Image.new("RGBA", new_size, (255, 255, 255, 255))
        
        offset = ((new_size[0] - img_no_bg.width) // 2, 
                 (new_size[1] - img_no_bg.height) // 2)
        white_bg.paste(img_no_bg, offset, img_no_bg)
        
        final_image = white_bg.convert("RGB")
        final_image = final_image.filter(ImageFilter.UnsharpMask(radius=0.5, percent=100, threshold=2))
        
        print("Enhanced image for catalog quality")
        
        img_byte_arr = io.BytesIO()
        final_image.save(img_byte_arr, format='JPEG', quality=98, optimize=True, dpi=(300, 300))
        img_byte_arr.seek(0)
        
        processed_bytes = img_byte_arr.read()
        print(f"REMBG processing complete. Output size: {len(processed_bytes)} bytes")
        
        return processed_bytes
        
    except Exception as e:
        print(f"REMBG processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

# --- FastAPI Endpoints ---

# --- REMOVED: The root endpoint that serves index.html ---
# @app.get("/")
# def read_index():
#     return FileResponse('frontend/index.html')

@app.post("/search/image", response_model=List[Hit])
async def search_image(file: UploadFile = File(...), top_k: int = 8, min_percent: float = 80.0):
    pil = Image.open(io.BytesIO(await file.read())).convert("RGB")
    qvec = embed_image_pil(pil, model, device)
    hits = search(index, qvec, id_map, top_k=top_k, min_percent=min_percent)
    return attach_metadata(hits)

@app.post("/search/text", response_model=List[Hit])
async def search_text(query: str = Form(...), top_k: int = Form(8), min_percent: float = Form(10.0)):
    qvec = embed_text(query, model, device)
    hits = search(index, qvec, id_map, top_k=top_k, min_percent=min_percent)
    return attach_metadata(hits)

@app.post("/search/hybrid", response_model=List[Hit])
async def search_hybrid(
    file: UploadFile = File(...), 
    query: str = Form(...), 
    top_k: int = Form(10), 
    min_percent: float = Form(10.0)
):
    """
    Hybrid search that combines image and text search to find results relevant to both queries.
    """
    try:
        print(f"Starting hybrid search with query: '{query}' and image: {file.filename}")
        
        # Generate dual query vectors
        pil_image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        qvec_image = embed_image_pil(pil_image, model, device)
        qvec_text = embed_text(query, model, device)
        
        print("Generated image and text embeddings")
        
        # Generate candidate pools
        CANDIDATE_POOL_SIZE = 500
        
        # Perform image search to get first candidate pool
        image_hits = search(index, qvec_image, id_map, top_k=CANDIDATE_POOL_SIZE, min_percent=0.0)
        print(f"Image search returned {len(image_hits)} candidates")
        
        # Perform text search to get second candidate pool
        text_hits = search(index, qvec_text, id_map, top_k=CANDIDATE_POOL_SIZE, min_percent=0.0)
        print(f"Text search returned {len(text_hits)} candidates")
        
        # Fuse and re-rank the results
        fused_scores = {}
        
        # Add image hits to fused_scores
        for hit in image_hits:
            fused_scores[hit['image_path']] = hit.copy()
        
        # Create set of text hit paths for intersection check
        text_paths = {hit['image_path'] for hit in text_hits}
        
        # Add text hits and combine scores for intersection items
        for text_hit in text_hits:
            path = text_hit['image_path']
            if path in fused_scores:
                # This image is in the intersection - combine the cosine scores
                fused_scores[path]['cosine'] += text_hit['cosine']
                print(f"Combined scores for {path}: image={fused_scores[path]['cosine'] - text_hit['cosine']:.4f} + text={text_hit['cosine']:.4f} = {fused_scores[path]['cosine']:.4f}")
        
        # Filter to keep only items that were present in both searches (intersection)
        intersection_results = []
        for path, hit in fused_scores.items():
            if path in text_paths:
                intersection_results.append(hit)
        
        print(f"Found {len(intersection_results)} items in intersection")
        
        # Sort by combined cosine score in descending order
        intersection_results.sort(key=lambda x: x['cosine'], reverse=True)
        
        # Take top_k results and update ranks
        final_results = intersection_results[:top_k]
        for i, hit in enumerate(final_results):
            hit['rank'] = i + 1
            # Recalculate match_percent based on combined score
            # Note: Since we combined two cosine scores, the range is different
            # We'll normalize it back to a 0-100% scale
            combined_score = hit['cosine']
            # Assuming each individual score was in [-1, 1] range, combined is in [-2, 2]
            # Convert to percentage: ((score + 2) / 4) * 100
            hit['match_percent'] = ((combined_score + 2.0) / 4.0) * 100.0
        
        print(f"Returning {len(final_results)} hybrid search results")
        
        # Add metadata and return
        return attach_metadata(final_results)
        
    except Exception as e:
        print(f"Hybrid search error: {e}")
        raise HTTPException(status_code=500, detail=f"Hybrid search failed: {str(e)}")

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
        
        file_content = await file.read()
        print(f"Received file: {file.filename}, size: {len(file_content)} bytes")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
            print(f"Saved temp file: {temp_file_path}")
        
        try:
            print("Calling Gemini API...")
            processed_image_bytes = process_with_gemini(temp_file_path)
            print(f"Received processed image: {len(processed_image_bytes)} bytes")
            
            return Response(
                content=processed_image_bytes,
                media_type="image/jpeg",
                headers={
                    "Content-Disposition": "inline; filename=gemini_processed.jpg"
                }
            )
            
        finally:
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
    """Remove background and create crisp catalog image with white background."""
    try:
        print("REMBG endpoint called")
        
        file_content = await file.read()
        print(f"Received file: {file.filename}, size: {len(file_content)} bytes")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
            print(f"Saved temp file: {temp_file_path}")
        
        try:
            print("Processing with REMBG...")
            processed_image_bytes = process_with_rembg(temp_file_path)
            print(f"REMBG processing complete: {len(processed_image_bytes)} bytes")
            
            return Response(
                content=processed_image_bytes,
                media_type="image/jpeg",
                headers={
                    "Content-Disposition": "inline; filename=rembg_processed.jpg"
                }
            )
            
        finally:
            try:
                os.unlink(temp_file_path)
                print(f"Cleaned up temp file: {temp_file_path}")
            except OSError as e:
                print(f"Error cleaning up temp file: {e}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in REMBG preprocessing: {e}")
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

@app.post("/qwen")
async def preprocess_quin(file: UploadFile = File(...)):
    content = await file.read()
    return Response(content=content, media_type=file.content_type)

@app.post("/nanobanana")
async def preprocess_nanobanana(file: UploadFile = File(...)):
    content = await file.read()
    return Response(content=content, media_type=file.content_type)