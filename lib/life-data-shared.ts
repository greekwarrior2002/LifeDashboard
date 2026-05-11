export type ResearchStep = {
  name: string;
  done: boolean;
  current?: boolean;
};

export type ResearchProject = {
  id: string;
  title: string;
  progress: number;
  phase: string;
  nextMilestone: string;
  color: "blue" | "violet" | "emerald";
  pipeline: ResearchStep[];
  deadline: string;
};

export type CashflowMonth = {
  id: string;
  month: string;
  income: number;
  expenses: number;
};

export type SpendingCategory = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export type Subscription = {
  id: string;
  name: string;
  cost: number;
  due: string;
};

export type FinanceData = {
  cashflow: CashflowMonth[];
  spendingBreakdown: SpendingCategory[];
  subscriptions: Subscription[];
  savings: {
    current: number;
    goal: number;
  };
};

export type TimelineMilestone = {
  id: string;
  date: string;
  title: string;
  kind: "academic" | "conference" | "achievement" | "research" | "trip" | "application" | "goal" | "personal";
  status: "done" | "active" | "planned";
};

export type LifeData = {
  researchProjects: ResearchProject[];
  finance: FinanceData;
  timeline: TimelineMilestone[];
  updatedAt: string | null;
};

export type InsightTone = "warning" | "info" | "good";

export type Insight = {
  tone: InsightTone;
  title: string;
  body: string;
};

export const DEFAULT_LIFE_DATA: LifeData = {
  updatedAt: null,
  researchProjects: [
    {
      id: "r1",
      title: "IAAO — Elite Cyclist Performance Study",
      progress: 72,
      phase: "Data collection",
      nextMilestone: "Recruit n=18 (6 to go)",
      color: "blue",
      pipeline: [
        { name: "Ethics", done: true },
        { name: "Recruitment", done: true },
        { name: "Data Collection", done: false, current: true },
        { name: "Analysis", done: false },
        { name: "Manuscript", done: false },
      ],
      deadline: "Aug 14",
    },
    {
      id: "r2",
      title: "Omeprazole Pilot — Lifter Recovery",
      progress: 38,
      phase: "Ethics amendment",
      nextMilestone: "REB resubmission",
      color: "violet",
      pipeline: [
        { name: "Protocol", done: true },
        { name: "Ethics", done: false, current: true },
        { name: "Recruitment", done: false },
        { name: "Data Collection", done: false },
        { name: "Manuscript", done: false },
      ],
      deadline: "Sep 02",
    },
    {
      id: "r3",
      title: "Transcontinental Runner — Case Study",
      progress: 91,
      phase: "Manuscript",
      nextMilestone: "Submit to JSCR",
      color: "emerald",
      pipeline: [
        { name: "Data", done: true },
        { name: "Analysis", done: true },
        { name: "Drafting", done: true },
        { name: "Review", done: false, current: true },
        { name: "Submit", done: false },
      ],
      deadline: "May 28",
    },
  ],
  finance: {
    cashflow: [
      { id: "jan", month: "Jan", income: 2680, expenses: 2050 },
      { id: "feb", month: "Feb", income: 2710, expenses: 2210 },
      { id: "mar", month: "Mar", income: 2980, expenses: 2380 },
      { id: "apr", month: "Apr", income: 3120, expenses: 2640 },
      { id: "may", month: "May", income: 3340, expenses: 2480 },
    ],
    spendingBreakdown: [
      { id: "rent", name: "Rent", value: 1100, color: "#5b8cff" },
      { id: "food", name: "Food", value: 480, color: "#a78bfa" },
      { id: "gas", name: "Gas", value: 220, color: "#fbbf24" },
      { id: "conference", name: "Conference", value: 380, color: "#22d3ee" },
      { id: "subscriptions", name: "Subscriptions", value: 86, color: "#34d399" },
      { id: "other", name: "Other", value: 214, color: "#fb7185" },
    ],
    subscriptions: [
      { id: "spotify", name: "Spotify", cost: 11, due: "May 14" },
      { id: "icloud", name: "iCloud 2TB", cost: 13, due: "May 18" },
      { id: "notion", name: "Notion", cost: 10, due: "May 22" },
      { id: "ticktick", name: "TickTick Premium", cost: 4, due: "May 26" },
      { id: "chatgpt", name: "ChatGPT Plus", cost: 27, due: "May 30" },
    ],
    savings: {
      current: 560,
      goal: 700,
    },
  },
  timeline: [
    { id: "m1", date: "2023 · Sep", title: "Started MSc — Kinesiology", kind: "academic", status: "done" },
    { id: "m2", date: "2024 · Apr", title: "First conference — CSEP poster", kind: "conference", status: "done" },
    { id: "m3", date: "2024 · Aug", title: "MCAT 517", kind: "achievement", status: "done" },
    { id: "m4", date: "2024 · Nov", title: "IAAO study — ethics approved", kind: "research", status: "done" },
    { id: "m5", date: "2025 · Feb", title: "Transcontinental case study draft", kind: "research", status: "done" },
    { id: "m6", date: "2025 · May", title: "Med school applications open", kind: "application", status: "active" },
    { id: "m7", date: "2025 · Sep", title: "Thesis defense target", kind: "academic", status: "planned" },
    { id: "m8", date: "2026 · Aug", title: "Med school start goal", kind: "goal", status: "planned" },
  ],
};

export function cloneDefaultLifeData(): LifeData {
  return structuredClone(DEFAULT_LIFE_DATA);
}

export function deriveInsights(data: LifeData): Insight[] {
  const projects = data.researchProjects;
  const finance = data.finance;
  const activeProjects = projects.filter((p) => p.progress < 100);
  const blockedProjects = activeProjects.filter((p) => p.progress < 50);
  const latest = finance.cashflow.at(-1);
  const previous = finance.cashflow.at(-2);
  const savingsPct = finance.savings.goal > 0
    ? Math.round((finance.savings.current / finance.savings.goal) * 100)
    : 0;
  const timelineActive = data.timeline.filter((m) => m.status === "active").length;

  const insights: Insight[] = [];

  if (blockedProjects.length > 0) {
    const p = blockedProjects[0];
    insights.push({
      tone: "warning",
      title: `${blockedProjects.length} research project${blockedProjects.length === 1 ? "" : "s"} under 50%`,
      body: `${p.title} is in ${p.phase}. Next useful move: ${p.nextMilestone}.`,
    });
  } else if (activeProjects.length > 0) {
    const avg = Math.round(
      activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length,
    );
    insights.push({
      tone: "good",
      title: `Research momentum is ${avg}% on average`,
      body: `${activeProjects.length} active project${activeProjects.length === 1 ? "" : "s"} still need attention before manuscript or submission stages close.`,
    });
  }

  if (latest && previous) {
    const latestNet = latest.income - latest.expenses;
    const previousNet = previous.income - previous.expenses;
    const delta = latestNet - previousNet;
    insights.push({
      tone: delta >= 0 ? "good" : "warning",
      title: `Cash flow ${delta >= 0 ? "improved" : "tightened"} by ${Math.abs(delta).toLocaleString()}`,
      body: `${latest.month} net is ${latestNet.toLocaleString()} versus ${previous.month} net of ${previousNet.toLocaleString()}.`,
    });
  }

  insights.push({
    tone: savingsPct >= 80 ? "good" : savingsPct >= 50 ? "info" : "warning",
    title: `Savings goal is ${savingsPct}% funded`,
    body: `${finance.savings.current.toLocaleString()} saved toward ${finance.savings.goal.toLocaleString()}. Adjust the finance card when new numbers come in.`,
  });

  if (timelineActive > 0) {
    insights.push({
      tone: "info",
      title: `${timelineActive} active timeline milestone${timelineActive === 1 ? "" : "s"}`,
      body: "Timeline now distinguishes completed, active, and planned events so future goals stop looking like things that already happened.",
    });
  }

  return insights.slice(0, 4);
}
