import os
from supabase import create_client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
_model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, runs fully local, no API

def embed(text: str) -> list[float]:
    return _model.encode(text).tolist()

def chunk_text(text: str, chunk_size: int = 1000) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

def ingest_repo(repo_url: str, files: dict[str, str]):
    """Embed all repo files and store in Supabase vector store.
    files: dict of {file_path: file_content}"""
    rows = []
    for file_path, content in files.items():
        for chunk in chunk_text(content):
            if not chunk.strip():
                continue
            rows.append({
                "repo_url": repo_url,
                "file_path": file_path,
                "content": chunk,
                "embedding": embed(chunk)
            })

    supabase.table("repo_chunks").delete().eq("repo_url", repo_url).execute()
    for i in range(0, len(rows), 50):
        supabase.table("repo_chunks").insert(rows[i:i+50]).execute()
    return len(rows)
