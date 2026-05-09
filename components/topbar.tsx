"use client";

import { Bell, Cloud, Search, Sparkles, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Topbar() {
  const now = useNow();
  const time = now
    ? now.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })
    : "—";
  const date = now
    ? now.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/[0.05] bg-ink-950/60 px-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <p className="text-[13px] font-medium text-subtle">{date}</p>
        <span className="h-3 w-px bg-white/10" />
        <p className="font-mono text-[13px] text-white">{time}</p>
        <span className="chip ml-2">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-emerald shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Focus mode
        </span>
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <div className="flex h-10 w-full max-w-xl items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-[13px] text-muted">
          <Search className="h-4 w-4" />
          <span>Ask Life OS — “what should I focus on right now?”</span>
          <span className="ml-auto rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px]">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white">
          <Cloud className="h-3.5 w-3.5 text-neon-blue" />
          12°C · Clear
        </button>
        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white">
          <Wifi className="h-3.5 w-3.5 text-neon-emerald" />
          Online
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(91,140,255,0.8)]" />
        </button>
        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-neon-blue/30 bg-gradient-to-r from-neon-blue/15 to-neon-violet/15 px-3 text-[12px] font-medium text-white shadow-glow transition-transform hover:scale-[1.02]">
          <Sparkles className="h-3.5 w-3.5" />
          AI Briefing
        </button>
      </div>
    </motion.header>
  );
}
