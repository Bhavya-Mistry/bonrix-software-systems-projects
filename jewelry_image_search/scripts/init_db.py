import os, sqlite3

DB_PATH = "data/products.sqlite"

SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    title TEXT,

    image_path TEXT UNIQUE
);
"""

def main():
    os.makedirs("data", exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.executescript(SCHEMA)
    con.commit()
    con.close()
    print(f"DB initialized at {DB_PATH}")

if __name__ == "__main__":
    main()
