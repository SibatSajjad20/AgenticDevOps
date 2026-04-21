"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";

interface ResultTabsProps {
  results: AnalysisResult;
  isPoetic: boolean;
}

export function ResultTabs({ results, isPoetic }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<"readme" | "linkedin" | "interview">("readme");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "readme", label: "README.md" },
    { id: "linkedin", label: "LinkedIn Post" },
    { id: "interview", label: "Interview Prep" },
  ] as const;

  return (
    <div className="bg-[#16161A] border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all",
              activeTab === tab.id
                ? "text-white border-b-2 border-indigo-500 bg-indigo-500/5"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === "readme" && (
            <motion.div key="readme" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto terminal-scroll">
                <pre className="text-[12px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{results.readme}</pre>
              </div>
              <div className="p-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => copyToClipboard(results.readme)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-700 uppercase tracking-widest"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy
                </button>
                <button
                  onClick={() => downloadFile(results.readme, "README.md")}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[10px] font-bold rounded-lg transition-colors border border-indigo-500/20 uppercase tracking-widest"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "linkedin" && (
            <motion.div key="linkedin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto terminal-scroll">
                {isPoetic && (
                  <div className="mb-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider">
                    ✨ Poetic Mode Active
                  </div>
                )}
                <div className="bg-black/30 rounded-lg p-4 text-[13px] leading-relaxed text-slate-300 border border-slate-800/50 italic font-serif whitespace-pre-wrap">
                  {results.linkedInPost}
                </div>
              </div>
              <div className="p-3 border-t border-slate-800">
                <button
                  onClick={() => copyToClipboard(results.linkedInPost)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-700 uppercase tracking-widest"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy to Clipboard
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "interview" && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto terminal-scroll p-4 space-y-3">
              {results.interviewQuestions.map((q, i) => (
                <div key={i} className="bento-inner-card p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-400 font-bold text-[11px] shrink-0 mt-0.5">Q{i + 1}</span>
                    <p className="text-[12px] font-bold text-white leading-relaxed">{q}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
