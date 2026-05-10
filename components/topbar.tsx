"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Cloud, Search, Sparkles, Wifi, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SearchTarget = { label: string; href: string; keywords: string };

const TARGETS: SearchTarget[] = [
  { label: "Mission Control", href: "/", keywords: "home dashboard mission control briefing" },
  { label: "Calendar", href: "/calendar", keywords: "calendar events schedule google" },
  { label: "Tasks", href: "/tasks", keywords: "tasks priorities ticktick todo" },
  { label: "Research", href: "/research", keywords: "research lab manuscript publications deadlines" },
  { label: "Health", href: "/health", keywords: "health recovery sleep hrv apple steps" },
  { label: "Finance", href: "/finance", keywords: "finance money cash spend savings subscriptions" },
  { label: "Cars", href: "/cars", keywords: "cars garage audi service mileage" },
  { label: "Applications", href: "/applications", keywords: "applications med school cycle" },
  { label: "Timeline", href: "/timeline", keywords: "timeline life milestones" },
  { label: "Journal", href: "/journal", keywords: "journal mood reflection diary" },
  { label: "Analytics", href: "/analytics", keywords: "analytics balance heatmap insights" },
  { label: "Settings", href: "/settings", keywords: "settings integrations profile cards" },
];

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function Topbar() {
  const now = useNow();
  const online = useOnline();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setShowNotifs(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return TARGETS;
    return TARGETS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) || t.keywords.includes(q),
    );
  })();

  const goTo = (href: string) => {
    setPaletteOpen(false);
    setQuery("");
    router.push(href);
  };

  const goToBriefing = () => {
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      router.push("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
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
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            title={focusMode ? "Exit focus mode" : "Enter focus mode"}
            className={cn(
              "chip ml-2 transition-colors",
              focusMode && "border-neon-emerald/40 bg-neon-emerald/10 text-white",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                focusMode
                  ? "bg-neon-emerald shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-muted",
              )}
            />
            Focus mode {focusMode ? "on" : "off"}
          </button>
        </div>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-10 w-full max-w-xl items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-[13px] text-muted transition-colors hover:border-white/[0.12] hover:text-subtle"
          >
            <Search className="h-4 w-4" />
            <span>Jump to a page — calendar, tasks, settings…</span>
            <span className="ml-auto rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px]">
              ⌘K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px] text-subtle"
            title="Live weather isn't connected yet"
          >
            <Cloud className="h-3.5 w-3.5 text-neon-blue" />
            12°C · Clear
          </span>
          <span
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px]",
              online ? "text-subtle" : "text-neon-rose",
            )}
            title={online ? "Online" : "Offline"}
          >
            <Wifi
              className={cn(
                "h-3.5 w-3.5",
                online ? "text-neon-emerald" : "text-neon-rose",
              )}
            />
            {online ? "Online" : "Offline"}
          </span>
          <button
            type="button"
            onClick={() => setShowNotifs((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(91,140,255,0.8)]" />
          </button>
          <button
            type="button"
            onClick={goToBriefing}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-neon-blue/30 bg-gradient-to-r from-neon-blue/15 to-neon-violet/15 px-3 text-[12px] font-medium text-white shadow-glow transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Briefing
          </button>
        </div>
      </motion.header>

      {showNotifs ? (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowNotifs(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-6 top-16 w-[300px] rounded-xl border border-white/[0.08] bg-ink-950/95 p-4 shadow-glass backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">Notifications</p>
              <button
                type="button"
                onClick={() => setShowNotifs(false)}
                className="text-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[12px] text-subtle">
              You're caught up — no new alerts.
            </p>
          </div>
        </div>
      ) : null}

      {paletteOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-ink-950/80 px-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/95 shadow-glass"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches[0]) goTo(matches[0].href);
                }}
                placeholder="Jump to a page…"
                className="h-12 flex-1 bg-transparent text-[14px] text-white placeholder:text-muted focus:outline-none"
              />
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-muted">
                Esc
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-1">
              {matches.length === 0 ? (
                <p className="px-3 py-4 text-[12px] text-muted">No results.</p>
              ) : (
                matches.map((t) => (
                  <button
                    key={t.href}
                    type="button"
                    onClick={() => goTo(t.href)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    <span>{t.label}</span>
                    <span className="font-mono text-[11px] text-muted">{t.href}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
