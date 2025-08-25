import os, io, sqlite3
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from PIL import Image
import torch
from retriever.models import load_model
from retriever.embed import embed_image_pil  # No need for preprocess anymore
from retriever.index import load_index, read_id_map, search

app = FastAPI(title="Jewelry Image Search", version="0.1.0")

IDX_PATH = "data/faiss.index"
MAP_PATH = "data/id_map.csv"
DB_PATH  = "data/products.sqlite"

# Load model and index
model, _ ,device, _ = load_model()
if not (os.path.exists(IDX_PATH) and os.path.exists(MAP_PATH)):
    raise RuntimeError("Index not found. Run: python jobs/build_index.py")
index = load_index(IDX_PATH)
id_map = read_id_map(MAP_PATH)

# Mount static files (frontend and images)
app.mount("/static", StaticFiles(directory="frontend"), name="static")
app.mount("/images", StaticFiles(directory="data/images"), name="images")

# Updated Hit model to match simplified database
class Hit(BaseModel):
    rank: int
    match_percent: float
    cosine: float
    image_path: str
    sku: Optional[str] = None
    title: Optional[str] = None

# Updated function to normalize paths and attach metadata
def attach_metadata(hits: List[dict]) -> List[Hit]:
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    enriched = []
    
    for h in hits:
        # Get the original path from search results
        original_path = h['image_path']
        
        # Normalize the path for consistent forward slashes in response
        normalized_path = original_path.replace('\\', '/')
        
        # Create a new hit dict with normalized path
        normalized_hit = h.copy()
        normalized_hit['image_path'] = normalized_path
        
        # Try the original path first for database lookup
        cur.execute("SELECT sku, title FROM products WHERE image_path = ? LIMIT 1", (original_path,))
        row = cur.fetchone()
        
        if row:
            sku, title = row
            enriched.append(Hit(**normalized_hit, sku=sku, title=title))
        else:
            # If not found, try with forward slashes
            cur.execute("SELECT sku, title FROM products WHERE image_path = ? LIMIT 1", (normalized_path,))
            row = cur.fetchone()
            
            if row:
                sku, title = row
                enriched.append(Hit(**normalized_hit, sku=sku, title=title))
            else:
                # If still not found, try with just the filename
                filename = os.path.basename(original_path)
                cur.execute("SELECT sku, title FROM products WHERE image_path LIKE ? LIMIT 1", (f'%{filename}',))
                row = cur.fetchone()
                
                if row:
                    sku, title = row
                    enriched.append(Hit(**normalized_hit, sku=sku, title=title))
                else:
                    # No match found, add without metadata
                    enriched.append(Hit(**normalized_hit))
    
    con.close()
    return enriched

# Serve the main page
@app.get("/")
def read_index():
    return FileResponse('frontend/index.html')

@app.post("/search/image", response_model=List[Hit])
async def search_image(file: UploadFile = File(...), top_k: int = 8, min_percent: float = 80.0):
    pil = Image.open(io.BytesIO(await file.read())).convert("RGB")
    # Make sure 'device' is passed as the argument for embedding
    qvec = embed_image_pil(pil, model, device)  # Pass device correctly
    hits = search(index, qvec, id_map, top_k=top_k, min_percent=min_percent)
    return attach_metadata(hits)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "index_size": len(id_map)}