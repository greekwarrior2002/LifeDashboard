"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type GlassCardProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  glow?: "blue" | "violet" | "emerald" | "amber" | "none";
  inset?: boolean;
};

const glowMap: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  blue: "before:bg-[radial-gradient(420px_circle_at_0%_0%,rgba(91,140,255,0.18),transparent_55%)]",
  violet: "before:bg-[radial-gradient(420px_circle_at_100%_0%,rgba(167,139,250,0.20),transparent_55%)]",
  emerald: "before:bg-[radial-gradient(420px_circle_at_0%_100%,rgba(52,211,153,0.18),transparent_55%)]",
  amber: "before:bg-[radial-gradient(420px_circle_at_100%_100%,rgba(251,191,36,0.16),transparent_55%)]",
  none: "before:bg-transparent",
};

export function GlassCard({
  children,
  glow = "blue",
  inset = false,
  className,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl shadow-glass",
        "transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.035]",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
        glowMap[glow],
        inset && "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  icon,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-subtle">
            {icon}
          </div>
        ) : null}
        <div>
          <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-subtle">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right}
    </div>
  );
}
