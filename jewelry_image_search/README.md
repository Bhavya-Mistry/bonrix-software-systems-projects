# Jewelry Image Search (FAISS + CLIP + FastAPI)

Minimal starter for image-to-image similarity search tailored for jewelry catalogs.
- Embeddings: CLIP ViT-B/32 via `open_clip_torch`
- Vector index: FAISS (IndexFlatIP)
- Metadata: SQLite (via stdlib `sqlite3`)
- API: FastAPI

## Project layout



## Steps to Run:

- Set up your project structure.

- Install dependencies with pip install -r requirements.txt.

- Initialize the SQLite database with **python scripts/init_db.py**

- Add product data to the database with **python scripts/add_products.py**

- Build the FAISS index with **python jobs/build_index.py**

- Start the FastAPI server with **uvicorn app.main:app --reload --port 8000**

- Test the image search with cURL