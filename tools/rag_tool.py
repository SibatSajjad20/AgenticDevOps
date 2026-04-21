import os
from supabase import create_client
from sentence_transformers import SentenceTransformer
from crewai.tools import tool
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
_model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(text: str) -> list[float]:
    return _model.encode(text).tolist()

@tool("RAG Code Search")
def search_codebase(query: str, repo_url: str) -> str:
    """Search the embedded codebase for relevant code chunks using semantic similarity.
    Use this to find specific logic, patterns, or implementations in the repo."""
    query_embedding = embed(query)
    result = supabase.rpc("match_repo_chunks", {
        "query_embedding": query_embedding,
        "match_repo_url": repo_url,
        "match_count": 5
    }).execute()
    chunks = result.data
    if not chunks:
        return "No relevant code found."
    return "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )
