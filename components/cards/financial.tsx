"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Wallet, ArrowUpRight, Sparkles, Save, Plus, Trash2, Check } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { DEFAULT_LIFE_DATA, type CashflowMonth, type FinanceData, type SpendingCategory } from "@/lib/life-data-shared";
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

export function FinancialDashboard({
  initialFinance = DEFAULT_LIFE_DATA.finance,
  editable = true,
}: {
  initialFinance?: FinanceData;
  editable?: boolean;
}) {
  const [finance, setFinance] = useState(initialFinance);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cashflow = finance.cashflow;
  const spendingBreakdown = finance.spendingBreakdown;
  const totalIn = cashflow.at(-1)?.income ?? 0;
  const totalOut = cashflow.at(-1)?.expenses ?? 0;
  const net = totalIn - totalOut;
  const avgNet = useMemo(() => {
    if (cashflow.length === 0) return 0;
    return Math.round(cashflow.reduce((sum, m) => sum + m.income - m.expenses, 0) / cashflow.length);
  }, [cashflow]);

  const patchMonth = (id: string, patch: Partial<CashflowMonth>) => {
    setFinance((cur) => ({
      ...cur,
      cashflow: cur.cashflow.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
    setSaved(false);
  };

  const patchSpend = (id: string, patch: Partial<SpendingCategory>) => {
    setFinance((cur) => ({
      ...cur,
      spendingBreakdown: cur.spendingBreakdown.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/life-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finance }),
      });
      if (!res.ok) throw new Error("save_failed");
      setSaved(true);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Cash Flow"
        subtitle={`${cashflow.length} months tracked · avg net ${formatCurrency(avgNet)}`}
        icon={<Wallet className="h-4 w-4 text-neon-blue" />}
        right={
          <div className="flex items-center gap-1.5">
            {saved ? (
              <span className="hidden items-center gap-1 text-[11px] text-neon-emerald sm:flex">
                <Check className="h-3 w-3" /> Saved
              </span>
            ) : null}
            {editable ? (
              <button
                onClick={() => (editing ? void save() : setEditing(true))}
                disabled={saving}
                className="flex h-7 items-center gap-1 rounded-md border border-neon-blue/25 bg-neon-blue/10 px-2 text-[11px] text-white transition-colors hover:bg-neon-blue/20 disabled:opacity-60"
              >
                <Save className="h-3 w-3" />
                {saving ? "Saving" : editing ? "Save" : "Edit"}
              </button>
            ) : null}
            <Link
              href="/finance"
              className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
            >
              Details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
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

      {editing ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-widest text-muted">Monthly flow</p>
              <button
                onClick={() =>
                  setFinance((cur) => ({
                    ...cur,
                    cashflow: [
                      ...cur.cashflow,
                      { id: `month-${Date.now()}`, month: "New", income: 0, expenses: 0 },
                    ],
                  }))
                }
                className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
              >
                <Plus className="h-3 w-3" /> Month
              </button>
            </div>
            <div className="space-y-2">
              {cashflow.map((m) => (
                <div key={m.id} className="grid grid-cols-[0.8fr_1fr_1fr_auto] gap-2">
                  <input value={m.month} onChange={(e) => patchMonth(m.id, { month: e.target.value })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
                  <input type="number" value={m.income} onChange={(e) => patchMonth(m.id, { income: Number(e.target.value) })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
                  <input type="number" value={m.expenses} onChange={(e) => patchMonth(m.id, { expenses: Number(e.target.value) })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
                  <button onClick={() => setFinance((cur) => ({ ...cur, cashflow: cur.cashflow.filter((item) => item.id !== m.id) }))} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-muted hover:text-neon-rose">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-widest text-muted">Spending</p>
              <button
                onClick={() =>
                  setFinance((cur) => ({
                    ...cur,
                    spendingBreakdown: [
                      ...cur.spendingBreakdown,
                      { id: `spend-${Date.now()}`, name: "New", value: 0, color: "#5b8cff" },
                    ],
                  }))
                }
                className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
              >
                <Plus className="h-3 w-3" /> Category
              </button>
            </div>
            <div className="space-y-2">
              {spendingBreakdown.map((s) => (
                <div key={s.id} className="grid grid-cols-[1fr_0.8fr_2rem_auto] gap-2">
                  <input value={s.name} onChange={(e) => patchSpend(s.id, { name: e.target.value })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
                  <input type="number" value={s.value} onChange={(e) => patchSpend(s.id, { value: Number(e.target.value) })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
                  <input type="color" value={s.color} onChange={(e) => patchSpend(s.id, { color: e.target.value })} className="h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.03]" />
                  <button onClick={() => setFinance((cur) => ({ ...cur, spendingBreakdown: cur.spendingBreakdown.filter((item) => item.id !== s.id) }))} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-muted hover:text-neon-rose">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input type="number" value={finance.savings.current} onChange={(e) => { setFinance((cur) => ({ ...cur, savings: { ...cur.savings, current: Number(e.target.value) } })); setSaved(false); }} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" aria-label="Current savings" />
              <input type="number" value={finance.savings.goal} onChange={(e) => { setFinance((cur) => ({ ...cur, savings: { ...cur.savings, goal: Number(e.target.value) } })); setSaved(false); }} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" aria-label="Savings goal" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-neon-amber/20 bg-neon-amber/[0.06] px-3 py-2 text-[12px] text-subtle">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-neon-amber" />
        <span>
          Latest month net is <span className="text-white">{formatCurrency(net)}</span>. Savings are at {finance.savings.goal > 0 ? Math.round((finance.savings.current / finance.savings.goal) * 100) : 0}% of target.
        </span>
      </div>
    </GlassCard>
  );
}
