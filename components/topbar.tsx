"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Cloud, Menu, Search, Sparkles, Wifi, X } from "lucide-react";
import { motion } from "framer-motion";
import { navItems } from "@/lib/nav";
import { useMobileNav } from "@/components/mobile-drawer";
import { cn } from "@/lib/utils";

const TARGETS = navItems.map((i) => ({
  label: i.label,
  href: i.href,
  keywords: i.keywords,
}));

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
  const { setOpen: setMobileNavOpen } = useMobileNav();
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
        className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-white/[0.05] bg-ink-950/60 px-3 pt-[max(0px,env(safe-area-inset-top))] backdrop-blur-xl sm:gap-4 sm:px-4 lg:px-6"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
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

          <p className="font-mono text-[13px] text-white sm:hidden">{time}</p>
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <span
            className="hidden h-10 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px] text-subtle md:flex"
            title="Live weather isn't connected yet"
          >
            <Cloud className="h-3.5 w-3.5 text-neon-blue" />
            12°C · Clear
          </span>
          <span
            className={cn(
              "hidden h-10 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px] md:flex",
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
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(91,140,255,0.8)]" />
          </button>
          <button
            type="button"
            onClick={goToBriefing}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-neon-blue/30 bg-gradient-to-r from-neon-blue/15 to-neon-violet/15 px-2.5 text-[12px] font-medium text-white shadow-glow transition-transform hover:scale-[1.02] sm:px-3"
            aria-label="AI Briefing"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Briefing</span>
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
            className="absolute right-3 top-14 w-[calc(100vw-1.5rem)] max-w-[300px] rounded-xl border border-white/[0.08] bg-ink-950/95 p-4 shadow-glass backdrop-blur-xl sm:right-6 sm:top-16"
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">Notifications</p>
              <button
                type="button"
                onClick={() => setShowNotifs(false)}
                className="text-muted hover:text-white"
                aria-label="Close notifications"
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
          className="fixed inset-0 z-40 flex items-start justify-center bg-ink-950/80 px-3 pt-[10vh] backdrop-blur-sm sm:px-4 sm:pt-[15vh]"
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
              <kbd className="hidden rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-muted sm:inline">
                Esc
              </kbd>
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="text-muted hover:text-white sm:hidden"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto py-1">
              {matches.length === 0 ? (
                <p className="px-3 py-4 text-[12px] text-muted">No results.</p>
              ) : (
                matches.map((t) => (
                  <button
                    key={t.href}
                    type="button"
                    onClick={() => goTo(t.href)}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-[13px] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white"
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
