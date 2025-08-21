# import os, glob, sqlite3

# IMG_DIR = os.path.join('data', 'images')
# DB_PATH = os.path.join('data', 'products.sqlite')

# # Simple SKU extraction logic: use the base filename as SKU
# def infer_sku_from_filename(path: str) -> str:
#     fname = os.path.basename(path)
#     base, _ = os.path.splitext(fname)
#     # For now, we will just use the full filename as the SKU
#     print(f"Processing file: {fname}")  # Debugging line
#     return base

# def upsert_product(con, sku: str, image_path: str):
#     con.execute("""
#         INSERT INTO products (sku, title, image_path)
#         VALUES (?, ?, ?)
#         ON CONFLICT(sku) DO UPDATE SET image_path=excluded.image_path
#     """, (sku, sku, image_path))

# def main():
#     con = sqlite3.connect(DB_PATH)
#     count = 0
#     for p in sorted(glob.glob(os.path.join(IMG_DIR, "**/*"), recursive=True)):
#         if p.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
#             print(f"Found image: {p}")  # Debugging line
#             sku = infer_sku_from_filename(p)
#             print(f"Extracted SKU: {sku}")  # Debugging line
#             upsert_product(con, sku, p)
#             count += 1
#     con.commit()
#     con.close()
#     print(f"Upserted {count} products into {DB_PATH}")

# if __name__ == "__main__":
#     main()



###################################################################################################################
# debugger script
import os, glob, sqlite3

IMG_DIR = os.path.join('data', 'images')
DB_PATH = os.path.join('data', 'products.sqlite')

# Simple SKU extraction logic: use the base filename as SKU
def infer_sku_from_filename(path: str) -> str:
    fname = os.path.basename(path)
    base, _ = os.path.splitext(fname)
    print(f"Processing file: {fname}")  # Debugging line
    return base

def upsert_product(con, sku: str, image_path: str):
    con.execute("""
        INSERT INTO products (sku, title, image_path)
        VALUES (?, ?, ?)
        ON CONFLICT(sku) DO UPDATE SET image_path=excluded.image_path
    """, (sku, sku, image_path))

def main():
    con = sqlite3.connect(DB_PATH)
    count = 0
    for p in sorted(glob.glob(os.path.join(IMG_DIR, "**/*"), recursive=True)):
        if p.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            print(f"Found image: {p}")  # Debugging line
            sku = infer_sku_from_filename(p)
            print(f"Extracted SKU: {sku}")  # Debugging line
            upsert_product(con, sku, p)
            count += 1
    con.commit()
    con.close()
    print(f"Upserted {count} products into {DB_PATH}")

if __name__ == "__main__":
    main()
