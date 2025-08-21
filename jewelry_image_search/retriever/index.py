import csv, faiss, numpy as np

def build_index(vectors: np.ndarray):
    index = faiss.IndexFlatIP(vectors.shape[1])  # inner product
    index.add(vectors)
    return index

def save_index(index, idx_path: str):
    faiss.write_index(index, idx_path)

def load_index(idx_path: str):
    return faiss.read_index(idx_path)

def write_id_map(paths, map_csv: str):
    with open(map_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["image_path"])
        for p in paths:
            w.writerow([p])

def read_id_map(map_csv: str):
    out = []
    with open(map_csv, "r", encoding="utf-8") as f:
        for i, row in enumerate(csv.reader(f)):
            if i == 0: continue
            if row: out.append(row[0])
    return out

def cosine_to_percent(score: float) -> float:
    return (score + 1.0) / 2.0 * 100.0

def search(index, query_vec: np.ndarray, id_map, top_k=10, min_percent=80.0):
    if query_vec.ndim == 1:
        query_vec = query_vec[None, :]
    scores, ids = index.search(query_vec.astype("float32"), top_k)
    hits = []
    for s, i in zip(scores[0], ids[0]):
        if i == -1: continue
        pct = cosine_to_percent(float(s))
        if pct >= min_percent:
            hits.append({
                "rank": len(hits)+1,
                "match_percent": round(pct, 2),
                "cosine": float(s),
                "image_path": id_map[i],
            })
    return hits
