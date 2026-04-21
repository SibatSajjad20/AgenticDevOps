"use client";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  logs: string[];
}

export function Terminal({ logs }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentTag = (log: string) => {
    if (log.includes("scraping") || log.includes("Architect") || log.includes("Embedded") || log.includes("Found")) return "AGT-1";
    if (log.includes("Writer") || log.includes("drafting") || log.includes("README")) return "AGT-2";
    if (log.includes("Interviewer") || log.includes("questions")) return "AGT-3";
    return "SYS";
  };

  const getTagColor = (tag: string) => {
    if (tag === "AGT-1") return "text-blue-400";
    if (tag === "AGT-2") return "text-green-400";
    if (tag === "AGT-3") return "text-purple-400";
    return "text-indigo-400";
  };

  // Limit logs to the last 200 to prevent DOM/memory overload
  const displayLogs = logs.slice(-200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F0F12] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl relative"
    >
      <div className="flex items-center gap-2 p-4 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="text-slate-500 text-[10px] uppercase tracking-widest ml-2">Agent Process Monitor</span>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 font-mono text-[13px] overflow-y-auto terminal-scroll bg-black/40">
        {displayLogs.map((log, i) => {
          const tag = getAgentTag(log);
          const isError = log.toLowerCase().includes("error") || log.toLowerCase().includes("failed");
          return (
            <div
              key={`${log}-${i}`}
              className="flex items-start gap-3 mb-1.5 leading-relaxed"
            >
              <span className="text-indigo-400 shrink-0 select-none text-[11px]">
                [{new Date().toLocaleTimeString([], { hour12: false })}]
              </span>
              <span className={cn("font-bold shrink-0 text-[11px]", getTagColor(tag))}>{tag}</span>
              <span className={cn("text-[12px]", isError ? "text-red-400" : "text-slate-400")}>{log}</span>
            </div>
          );
        })}
        {displayLogs.length === 0 && (
          <div className="text-slate-600 italic text-sm">Waiting for mission start...</div>
        )}
      </div>
      <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 bg-indigo-600/5 blur-[60px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
