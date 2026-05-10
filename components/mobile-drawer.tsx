"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, LogOut, Search, X } from "lucide-react";
import { navItems } from "@/lib/nav";
import { useUser } from "@/lib/hooks/use-user";
import { cn } from "@/lib/utils";

type MobileNavContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<MobileNavContextValue>(
    () => ({ open, setOpen, toggle: () => setOpen((v) => !v) }),
    [open],
  );
  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {} } as MobileNavContextValue;
  }
  return ctx;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function MobileDrawer() {
  const { open, setOpen } = useMobileNav();
  const path = usePathname();
  const { user } = useUser();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [path, setOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const name = user?.profile.name?.trim() || "Welcome";
  const subtitle =
    [user?.profile.program, user?.profile.cycle].filter(Boolean).join(" · ") ||
    "Set up your profile";

  const q = query.trim().toLowerCase();
  const visibleItems = q
    ? navItems.filter((i) => i.label.toLowerCase().includes(q) || i.keywords.includes(q))
    : navItems;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-white/[0.05] bg-ink-950/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5 px-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 shadow-glow">
                <Command className="h-4 w-4 text-white" />
                <span className="absolute -inset-px -z-10 rounded-xl bg-[radial-gradient(60%_60%_at_50%_50%,rgba(91,140,255,0.5),transparent_70%)] blur-md" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight text-white">Life OS</p>
                <p className="text-[11px] text-muted">Command Center · v1.0</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 px-2">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-[13px] text-muted focus-within:border-white/[0.14]">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search workspace…"
                  className="h-full flex-1 bg-transparent text-[14px] text-white placeholder:text-muted focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-muted hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <nav className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
              <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                Workspace
              </p>
              {visibleItems.length === 0 ? (
                <p className="px-3 py-2 text-[12px] text-muted">No matches.</p>
              ) : null}
              {visibleItems.map((item) => {
                const Active = path === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition-colors",
                      Active
                        ? "bg-white/[0.05] text-white"
                        : "text-subtle hover:bg-white/[0.03] hover:text-white",
                    )}
                  >
                    {Active ? (
                      <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-gradient-to-b from-neon-blue to-neon-violet shadow-glow" />
                    ) : null}
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        Active ? "text-neon-blue" : "text-muted group-hover:text-subtle",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "rounded-full border px-1.5 text-[10px] font-medium leading-4",
                          item.badge === "Live"
                            ? "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald"
                            : "border-white/10 bg-white/[0.04] text-subtle",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-violet text-xs font-semibold text-white">
                  {initials(name)}
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[13px] font-semibold text-white">{name}</p>
                  <p className="truncate text-[11px] text-muted">{subtitle}</p>
                </div>
                <form method="POST" action="/api/auth/logout" className="ml-auto">
                  <button
                    type="submit"
                    title="Sign out"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
