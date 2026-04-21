# AgenticDevOps — Full Build Plan
> Auto-Code Review & Portfolio Builder using CrewAI, FastAPI, Next.js 15, and Supabase

---

## Project Overview

A user pastes a GitHub repo URL. A multi-agent AI crew (CrewAI) then:
1. Analyzes the codebase (tech stack, patterns, bugs)
2. Writes a professional README + LinkedIn post
3. Generates 10 deep interview questions about that specific code
4. Streams all of this live to a beautiful Next.js UI

---

## Folder Structure

```
AgenticDevOps/
├── backend/
│   ├── agents/
│   │   ├── architect.py
│   │   ├── writer.py
│   │   └── interviewer.py
│   ├── tools/
│   │   ├── github_tool.py
│   │   └── rag_tool.py
│   ├── crew.py
│   ├── main.py
│   ├── rag_ingest.py
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── analyze/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── RepoInput.tsx
│   │   ├── AgentStream.tsx
│   │   └── ResultTabs.tsx
│   ├── lib/api.ts
│   └── package.json
│
├── PLAN.md
└── .env.example
```

---

## Phase 1 — Environment Setup (Day 1)

### Accounts & Keys (All Free)
- [ ] Google AI Studio → GEMINI_API_KEY
- [ ] Supabase → SUPABASE_URL + SUPABASE_SERVICE_KEY
- [ ] GitHub → GITHUB_TOKEN
- [ ] Install Ollama locally → `ollama pull llama3`
- [ ] Vercel account
- [ ] Hugging Face account

### Supabase Schema
```sql
create extension if not exists vector;

create table repo_chunks (
  id uuid primary key default gen_random_uuid(),
  repo_url text,
  file_path text,
  content text,
  embedding vector(768)
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  repo_url text,
  readme text,
  linkedin_post text,
  interview_questions jsonb,
  tech_stack jsonb,
  created_at timestamp default now()
);
```

---

## Phase 2 — Python Backend (Days 2–4)

- `config.py` — LLM toggle (Gemini / Ollama)
- `tools/github_tool.py` — GitHub API scraper
- `rag_ingest.py` — Embed repo files into Supabase vector store
- `tools/rag_tool.py` — Vector similarity search tool for agents
- `agents/architect.py` — Analyzes tech stack, patterns, bugs
- `agents/writer.py` — Writes README + LinkedIn post (+ Poetic Mode)
- `agents/interviewer.py` — Generates 10 interview questions
- `crew.py` — Sequential CrewAI orchestration
- `main.py` — FastAPI + SSE streaming endpoint

---

## Phase 3 — Next.js Frontend (Days 5–7)

- Landing page with repo URL input + LLM toggle + Poetic Mode toggle
- Live SSE agent stream (terminal-style log)
- Results page with 3 tabs: README / LinkedIn / Interview Prep
- Shadcn/UI components

---

## Phase 4 — Advanced Features (Days 8–10)

- Agentic RAG (agents query vector DB, not full prompt)
- Streaming UI polish (agent avatars, typing animation)
- Export: Download README, Copy LinkedIn, PDF interview sheet

---

## Phase 5 — Deployment (Days 11–12)

- Backend → Hugging Face Spaces (Docker)
- Frontend → Vercel
- CORS configured for production domains

---

## Build Order

| Day | Task |
|-----|------|
| 1 | Setup accounts, Supabase schema |
| 2 | github_tool + rag_ingest, test with real repo |
| 3 | All 3 agents + crew.py, test in terminal |
| 4 | FastAPI main.py with SSE |
| 5 | Next.js landing page + RepoInput |
| 6 | AgentStream SSE consumer |
| 7 | ResultTabs + full results page |
| 8 | Poetic Mode + Local/Cloud toggle |
| 9 | Export features |
| 10 | UI polish + error handling |
| 11 | Deploy backend to Hugging Face |
| 12 | Deploy frontend to Vercel |

---

*Built with CrewAI · FastAPI · Next.js 15 · Supabase · Gemini 1.5 Flash*
