"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Cpu, Brain, Sparkles, Code2, RefreshCcw, ArrowRight, AlertCircle,
  Mail, Briefcase, ExternalLink, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { Terminal } from "@/components/Terminal";
import { ResultTabs } from "@/components/ResultTabs";
import type { AnalysisResult } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function parseResults(rawAnalysis: string, rawWriting: string, rawInterview: string): Partial<AnalysisResult> {
  // Extract tech stack from analysis text
  const techStackMatch = rawAnalysis.match(/tech_?stack["\s:]+\[([^\]]+)\]/i);
  const techStack = techStackMatch
    ? techStackMatch[1].split(",").map((s) => s.replace(/['"]/g, "").trim()).filter(Boolean)
    : rawAnalysis.split("\n").filter(l => l.includes("•") || l.includes("-")).slice(0, 6).map(l => l.replace(/[-•*]/g, "").trim()).filter(Boolean).slice(0, 6);

  // Extract README and LinkedIn from writer output
  const readmeMatch = rawWriting.match(/##\s*README([\s\S]*?)(?=##\s*LinkedIn|$)/i);
  const linkedinMatch = rawWriting.match(/##\s*LinkedIn\s*Post([\s\S]*?)$/i);
  const readme = readmeMatch ? readmeMatch[1].trim() : rawWriting;
  const linkedInPost = linkedinMatch ? linkedinMatch[1].trim() : "";

  // Extract interview questions
  const lines = rawInterview.split("\n").filter(l => /^\d+[\.\)]/.test(l.trim()));
  const interviewQuestions = lines.length > 0
    ? lines.map(l => l.replace(/^\d+[\.\)]\s*/, "").trim())
    : rawInterview.split("\n").filter(l => l.trim().endsWith("?")).slice(0, 10);

  return { techStack, readme, linkedInPost, interviewQuestions };
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [isPoetic, setIsPoetic] = useState(false);
  const [aiMode, setAiMode] = useState<"gemini" | "ollama">("gemini");
  const [logs, setLogs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const handleStart = async () => {
    if (!url.includes("github.com")) {
      setError("Please enter a valid GitHub URL");
      return;
    }
    
    // Abort any ongoing request before starting a new one to prevent parallel streams
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setError(null);
    setIsAnalyzing(true);
    setResults(null);
    setLogs([]);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: url, llm_mode: aiMode, poetic_mode: isPoetic }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: AnalysisResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) eventType = line.slice(6).trim();
            if (line.startsWith("data:")) dataStr = line.slice(5).trim();
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (eventType === "status") addLog(data.message);
            if (eventType === "error") {
              setError(data.message);
              addLog(`❌ ${data.message}`);
            }
            if (eventType === "result") {
              const parsed = parseResults(data.analysis || "", data.readme_and_linkedin || "", data.interview_questions || "");
              finalResult = {
                analysis: data.analysis || "",
                readme: parsed.readme || "",
                linkedInPost: parsed.linkedInPost || "",
                interviewQuestions: parsed.interviewQuestions || [],
                techStack: parsed.techStack || [],
                fileCount: data.file_count || 0,
                chunkCount: data.chunk_count || 0,
              };
            }
            if (eventType === "done") {
              addLog("✅ Mission complete. Portfolio package delivered.");
              if (finalResult) setResults(finalResult);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Analysis aborted");
        return;
      }
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      addLog(`❌ Critical Failure: ${msg}`);
    } finally {
      // Don't set isAnalyzing to false if we restarted a new analysis mid-way
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen text-white selection:bg-blue-500/30 selection:text-blue-200">
      <ThreeCanvas />

      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex items-center justify-between z-20 container mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Cpu size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Agentic<span className="text-indigo-400">DevOps</span>
          </h1>
        </div>

        {!results && !isAnalyzing && (
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> System Operational
            </span>
            <span className="opacity-40">|</span>
            <span>Agents: 3 Active</span>
          </div>
        )}

        {results && (
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full bg-[#16161A] border border-slate-800 rounded-full py-2 px-6 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleStart}
                className="absolute right-1 top-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-semibold transition-all"
              >
                Re-Analyze
              </button>
            </div>
          </div>
        )}

        <div className="flex bg-[#16161A] p-1 rounded-lg border border-slate-800">
          {(["gemini", "ollama"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAiMode(mode)}
              className={cn(
                "px-3 py-1 text-[10px] uppercase font-bold rounded transition-all",
                aiMode === mode ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10 max-w-6xl min-h-screen flex flex-col">
        <AnimatePresence mode="wait">

          {/* HERO STATE */}
          {!results && !isAnalyzing && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-[0.2em]"
              >
                Multi-Agent Portfolio Intelligence
              </motion.div>

              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent leading-[0.9]">
                CODE INTO<br />CONTENT.
              </h2>

              <p className="text-slate-400 text-lg mb-12 max-w-xl leading-relaxed">
                Automated technical analysis, branding, and career preparation powered by specialized neural agents.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              <div className="w-full max-w-xl space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-1000" />
                  <div className="relative bg-[#16161A] border border-slate-800 rounded-full p-2 flex items-center gap-2 shadow-2xl">
                    <div className="pl-4 text-slate-500"><GitBranch size={20} /></div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleStart()}
                      placeholder="Paste GitHub Repository URL..."
                      className="flex-1 bg-transparent border-none outline-none text-white py-4 px-2 text-lg placeholder:text-slate-700"
                    />
                    <button
                      onClick={handleStart}
                      className="bg-indigo-600 text-white font-bold h-14 px-10 rounded-full flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                      START MISSION <ArrowRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setIsPoetic(!isPoetic)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-lg border transition-all text-[11px] font-bold uppercase tracking-wider",
                      isPoetic
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <Sparkles size={14} /> Poetic Mode: {isPoetic ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYZING STATE */}
          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 h-[calc(100vh-200px)]"
            >
              <div className="col-span-8 row-span-4">
                <Terminal logs={logs} />
              </div>

              <div className="col-span-4 row-span-2 bg-gradient-to-br from-[#16161A] to-[#0F0F12] border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full border border-indigo-500/20 flex items-center justify-center bg-indigo-500/5">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <RefreshCcw size={32} className="text-indigo-500" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Initializing Engine</h3>
                  <p className="text-[10px] text-slate-500 uppercase mt-1">Agent Sync in progress...</p>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(logs.length * 10, 90)}%` }}
                    className="bg-indigo-600 h-full shadow-[0_0_10px_#6366f1]"
                  />
                </div>
              </div>

              <div className="col-span-4 row-span-4 bg-[#16161A] border border-slate-800 rounded-2xl flex items-center justify-center">
                <div className="text-center opacity-20">
                  <Brain size={64} className="mx-auto mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Knowledge Extraction</p>
                </div>
              </div>

              <div className="col-span-8 row-span-2 bg-[#0F0F12] border border-slate-800 rounded-2xl flex items-center justify-center">
                <div className="text-center opacity-20">
                  <Code2 size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Codebase Semantic Mapping</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {results && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 grid grid-cols-12 gap-4 h-[calc(100vh-200px)]"
            >
              {/* Terminal - left col */}
              <div className="col-span-5 row-span-full">
                <Terminal logs={logs} />
              </div>

              {/* Right col */}
              <div className="col-span-7 flex flex-col gap-4">
                {/* Tech Stack */}
                <div className="bg-gradient-to-br from-[#16161A] to-[#0F0F12] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Detected Ecosystem</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.techStack.slice(0, 8).map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-full uppercase tracking-wide">
                        {tech}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[11px] rounded-full">
                      {results.fileCount} files · {results.chunkCount} chunks
                    </span>
                  </div>
                </div>

                {/* Result Tabs */}
                <div className="flex-1 min-h-0">
                  <ResultTabs results={results} isPoetic={isPoetic} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Meet the Developer & Project Spotlight */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 border-t border-slate-800/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Intelligence Behind the Architecture</h2>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Developer Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-3xl border border-slate-800 glass-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-indigo-500/30"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600/5 to-purple-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="flex items-center gap-5 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl shadow-xl shadow-indigo-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Code2 size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Sibat Sajjad</h3>
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Full Stack AI Engineer</p>
              </div>
            </div>

            <p className="mb-8 text-slate-400 leading-relaxed text-sm">
              Architecting the bridge between autonomous agents and user experience. Focused on building scalable AI applications that transform raw data into actionable knowledge.
            </p>

            <div className="mb-10 space-y-4">
              {[
                { title: 'Agentic Workflows', desc: 'CrewAI, LangChain, Multi-Agent Orchestration' },
                { title: 'Neural Architectures', desc: 'FastAPI, Python, RAG, Supabase Vector DB' },
                { title: 'Interface Design', desc: 'Next.js 15, Tailwind CSS, Framer Motion' },
              ].map((skill) => (
                <div key={skill.title} className="transition-transform duration-300 hover:translate-x-2">
                  <p className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-1">{skill.title}</p>
                  <p className="text-[13px] text-slate-500">{skill.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sibat-sajjad-a096731a9/', icon: <Briefcase size={16} /> },
                { label: 'GitHub', href: 'https://github.com/SibatSajjad20', icon: <GitBranch size={16} /> },
                { label: 'Email', href: 'https://mail.google.com/mail/?view=cm&to=sajjadsibat33@gmail.com', icon: <Mail size={16} /> },
              ].map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="relative flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-2.5 text-xs font-bold text-slate-300 transition-all duration-300 hover:border-indigo-500/50 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 group/btn overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">{link.icon} {link.label}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Project Details Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-3xl border border-slate-800 glass-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/30"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/5 to-indigo-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="flex items-center gap-5 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                <Layers className="text-indigo-400" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">AgenticDevOps</h3>
                <p className="text-sm font-bold text-purple-400 uppercase tracking-widest">v 1.0.0 Alpha</p>
              </div>
            </div>

            <p className="mb-8 text-slate-400 leading-relaxed text-sm">
              An advanced AI ecosystem that deconstructs GitHub repositories to build technical portfolios. It automates technical documentation, social presence, and interview readiness.
            </p>

            <div className="mb-10 space-y-4">
              {[
                { icon: '🤖', title: 'Agent Trinity', desc: 'Architect, Writer, and Interviewer specialized agents.' },
                { icon: '🧠', title: 'Contextual RAG', desc: 'Deep semantic mapping of codebases via vector embedding.' },
                { icon: '⚡', title: 'Real-time Streaming', desc: 'Live mission logs via Server-Sent Events (SSE) integration.' },
                { icon: '🔒', title: 'Secure Ops', desc: 'Stateless analysis with secure environment variable handling.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 transition-transform duration-300 hover:translate-x-2">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 text-lg shadow-inner">{f.icon}</span>
                  <div>
                    <p className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-1">{f.title}</p>
                    <p className="text-[13px] text-slate-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['FastAPI', 'CrewAI', 'Next.js 15', 'Tailwind', 'Gemini AI', 'Supabase'].map((tag) => (
                <span key={tag}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-all duration-300 hover:border-indigo-500/40 hover:text-indigo-400 cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-[#0A0A0C]/80 border-t border-slate-800 p-8 z-20 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Cpu size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">AgenticDevOps Intelligence</p>
              <p className="text-[9px] text-slate-600 font-mono mt-1">© 2026 Sibat Sajjad. All Rights Reserved.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
              <a href="https://mail.google.com/mail/?view=cm&to=sajjadsibat33@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Contact</a>
            </div>
            <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />
            <div className="flex gap-4">
              <a href="https://github.com/SibatSajjad20" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900/50 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-600/20 transition-all">
                <GitBranch size={16} />
              </a>
              <a href="https://www.linkedin.com/in/sibat-sajjad-a096731a9/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900/50 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-600/20 transition-all">
                <Briefcase size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
