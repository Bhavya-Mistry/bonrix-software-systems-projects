import os
import sys

# Add the root project directory to sys.path so Python can find `retriever`
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from retriever.models import load_model
from retriever.embed import embed_directory
from retriever.index import build_index, save_index, write_id_map

# Define the directories
IMG_DIR = "data/images"
IDX_PATH = "data/faiss.index"
MAP_PATH = "data/id_map.csv"

def main():
    # Ensure that the "data" folder exists
    os.makedirs("data", exist_ok=True)
    
    # Load the model (ignore preprocess since we don't use it anymore)
    model, _, device, _ = load_model()  # Changed: ignore preprocess parameter
    
    # Process images and generate embeddings (without preprocessing)
    X, paths = embed_directory(IMG_DIR, model, device)  # Changed: removed preprocess parameter
    
    # Build the FAISS index
    index = build_index(X)
    
    # Save the FAISS index and the image path map
    save_index(index, IDX_PATH)
    write_id_map(paths, MAP_PATH)
    
    # --- After saving the index ---
    print(f"FAISS index contains {index.ntotal} vectors.")  # Prints the number of vectors in the index

    # Output the result
    print(f"Indexed {len(paths)} images → {IDX_PATH}")

if __name__ == "__main__":
    main()