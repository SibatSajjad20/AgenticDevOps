import os
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from tools.github_tool import fetch_repo_files
from rag_ingest import ingest_repo
from crew import build_crew

load_dotenv()

app = FastAPI(title="AgenticDevOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "")],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    repo_url: str
    llm_mode: str = "gemini"   # "gemini" | "ollama"
    poetic_mode: bool = False

def sse_event(event: str, data: dict | str) -> str:
    payload = data if isinstance(data, str) else json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"

async def run_analysis(repo_url: str, llm_mode: str, poetic_mode: bool):
    # Step 1: Scrape repo
    yield sse_event("status", {"message": "🏗️ Architect is scraping the repository..."})
    await asyncio.sleep(0)

    try:
        files: dict = fetch_repo_files(repo_url)
    except Exception as e:
        yield sse_event("error", {"message": f"Failed to scrape repo: {str(e)}"})
        return

    yield sse_event("status", {"message": f"📁 Found {len(files)} files. Embedding into vector store..."})
    await asyncio.sleep(0)

    # Step 2: Ingest into Supabase vector store
    try:
        chunk_count = ingest_repo(repo_url, files)
    except Exception as e:
        yield sse_event("error", {"message": f"RAG ingestion failed: {str(e)}"})
        return

    yield sse_event("status", {"message": f"✅ Embedded {chunk_count} chunks. Starting agents..."})
    await asyncio.sleep(0)

    # Step 3: Run CrewAI
    yield sse_event("status", {"message": "🏗️ Architect is analyzing tech stack and patterns..."})
    await asyncio.sleep(0)

    try:
        crew = build_crew(repo_url, llm_mode, poetic_mode)
        result = await asyncio.to_thread(crew.kickoff)
    except Exception as e:
        yield sse_event("error", {"message": f"Agent crew failed: {str(e)}"})
        return

    yield sse_event("status", {"message": "✍️ Writer is drafting README and LinkedIn post..."})
    await asyncio.sleep(0)
    yield sse_event("status", {"message": "🎤 Interviewer is generating questions..."})
    await asyncio.sleep(0)

    # Step 4: Parse and stream final result
    tasks_output = result.tasks_output
    yield sse_event("result", {
        "analysis":            tasks_output[0].raw if len(tasks_output) > 0 else "",
        "readme_and_linkedin": tasks_output[1].raw if len(tasks_output) > 1 else "",
        "interview_questions": tasks_output[2].raw if len(tasks_output) > 2 else "",
        "file_count":          len(files),
        "chunk_count":         chunk_count,
    })

    yield sse_event("done", {"message": "Analysis complete!"})

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.repo_url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL.")

    return StreamingResponse(
        run_analysis(req.repo_url, req.llm_mode, req.poetic_mode),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

@app.get("/health")
def health():
    return {"status": "ok"}
