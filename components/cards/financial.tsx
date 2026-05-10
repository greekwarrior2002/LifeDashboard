"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, ArrowUpRight, Sparkles } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cashflow, spendingBreakdown } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(15,18,24,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 11,
    color: "#e6e8ee",
  },
} as const;

export function FinancialDashboard() {
  const totalIn = cashflow.at(-1)?.income ?? 0;
  const totalOut = cashflow.at(-1)?.expenses ?? 0;
  const net = totalIn - totalOut;

  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Cash Flow"
        subtitle="Demo values · finance import coming soon"
        icon={<Wallet className="h-4 w-4 text-neon-blue" />}
        right={
          <Link
            href="/finance"
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
          >
            Details <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5 sm:p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted">In</p>
          <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{formatCurrency(totalIn)}</p>
          <p className="mt-0.5 text-[10px] text-neon-emerald sm:text-[11px]">+7% vs avg</p>
        </div>
        <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5 sm:p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted">Out</p>
          <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{formatCurrency(totalOut)}</p>
          <p className="mt-0.5 text-[10px] text-neon-amber sm:text-[11px]">+12% conf travel</p>
        </div>
        <div className="rounded-lg border border-white/[0.05] bg-gradient-to-br from-neon-blue/10 to-neon-violet/10 p-2.5 sm:p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted">Net</p>
          <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{formatCurrency(net)}</p>
          <p className="mt-0.5 text-[10px] text-subtle sm:text-[11px]">→ savings</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflow} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b8cff" />
                  <stop offset="100%" stopColor="#5b8cff" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="income" fill="url(#incomeBar)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="url(#expenseBar)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <div className="h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip {...tooltipStyle} />
                <Pie
                  data={spendingBreakdown}
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {spendingBreakdown.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1">
            {spendingBreakdown.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-subtle">{s.name}</span>
                </div>
                <span className="font-mono text-muted">{formatCurrency(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-neon-amber/20 bg-neon-amber/[0.06] px-3 py-2 text-[12px] text-subtle">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-neon-amber" />
        <span>
          Conference travel up <span className="text-white">+38% MoM</span>. Your CSEP trip accounts for $310. On track for May savings goal of $700.
        </span>
      </div>
    </GlassCard>
  );
}
