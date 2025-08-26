import os, io, sqlite3, base64, requests
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

app = FastAPI(title="Jewelry Image Search", version="0.1.0")

# --- Constants and Configuration ---
IDX_PATH = "data/faiss.index"
MAP_PATH = "data/id_map.csv"
DB_PATH  = "data/products.sqlite"


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
    # ... (existing metadata attachment logic remains the same)
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
    content = await file.read()
    return Response(content=content, media_type=file.content_type)
   

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
