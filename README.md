# 🚀 AgenticDevOps

**The Ultimate AI-Driven Code Analysis & Portfolio Builder.**

[![Review](https://img.shields.io/badge/Review-Automated-green)](#)
[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20Next.js-blue)](#)
[![AI](https://img.shields.io/badge/Powered%20By-CrewAI%20%20Gemini-orange)](#)

AgenticDevOps is a high-performance, multi-agent system designed to bridge the gap between code and career. By simply providing a GitHub repository URL, a specialized "Crew" of AI agents analyzes your codebase, generates professional documentation, crafts viral LinkedIn posts, and prepares you for deep technical interviews.

![AgenticDevOps Preview](C:\Users\coco\.gemini\antigravity\brain\53645ddd-288e-48d9-a53c-3225185fa3a5\agentic_devops_preview_1776772900116.png)

---

## ✨ Features

- **🔍 Deep Repo Analysis**: Automated tech stack detection, pattern recognition, and bug identification by an AI Architect.
- **📄 Killer README Generation**: Instantly creates professional, high-impact README files that make your project stand out.
- **📱 LinkedIn Optimizer**: Generates engaging, "portfolio-worthy" social media posts to showcase your work.
- **🎤 Interview Prep**: 10 tailored technical questions based on *your* specific implementation and logic.
- **⚡ Live Agent Streaming**: Watch the AI "think" and process in real-time through a terminal-style UI.
- **🧠 Agentic RAG**: Uses vector search (Supabase) to handle large codebases without losing context.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI Orchestration**: [CrewAI](https://www.crewai.com/)
- **LLMs**: Google Gemini 1.5 Flash / Ollama (Llama 3)
- **Vector DB**: [Supabase](https://supabase.com/) (pgvector)
- **Streaming**: Server-Sent Events (SSE)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Shadcn/UI
- **Language**: TypeScript
- **Animations**: Lucide React & Framer Motion

---

## 🚀 Quick Start

### 1. Clone & Setup Backend
```bash
git clone https://github.com/[YOUR_USERNAME]/AgenticDevOps.git
cd AgenticDevOps
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GITHUB_TOKEN=your_github_personal_access_token
```

### 3. Run the Backend
```bash
python main.py
```

### 4. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the magic.

---

## 🤖 The Agent Crew

1. **Architect**: Analyzes the structure, design patterns, and potential optimizations.
2. **Writer**: Translates code technicalities into human-readable, high-impact documentation.
3. **Interviewer**: Challenges the developer with deep-dive questions based on the repo analysis.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ by the AgenticDevOps Team.*
