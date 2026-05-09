"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  CalendarDays,
  CheckSquare,
  FlaskConical,
  HeartPulse,
  Wallet,
  Car,
  GraduationCap,
  Clock,
  NotebookPen,
  BarChart3,
  Settings,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Mission Control", icon: Home, badge: "Live" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, badge: "12" },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/applications", label: "Applications", icon: GraduationCap },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-[248px] shrink-0 flex-col border-r border-white/[0.05] bg-ink-950/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 shadow-glow">
          <Command className="h-4 w-4 text-white" />
          <span className="absolute -inset-px -z-10 rounded-xl bg-[radial-gradient(60%_60%_at_50%_50%,rgba(91,140,255,0.5),transparent_70%)] blur-md" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-white">Life OS</p>
          <p className="text-[11px] text-muted">Command Center · v1.0</p>
        </div>
      </div>

      <div className="mt-6 px-2">
        <div className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-[12px] text-muted">
          <span className="opacity-60">⌘</span>K
          <span className="ml-1">Search anything</span>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
        <p className="px-3 pb-1 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Workspace
        </p>
        {items.map((item, i) => {
          const Active = path === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.018, duration: 0.35 }}
                className={cn(
                  "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
                  Active
                    ? "bg-white/[0.05] text-white"
                    : "text-subtle hover:bg-white/[0.03] hover:text-white",
                )}
              >
                {Active ? (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-gradient-to-b from-neon-blue to-neon-violet shadow-glow"
                  />
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
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-violet text-xs font-semibold text-white">
            DM
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-white">Damian M.</p>
            <p className="text-[11px] text-muted">MSc · Med Apps · TA</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
