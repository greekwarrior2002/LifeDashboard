// Sample data for cards that don't yet have real integrations
// (health, finance, cars, research, etc). Tasks and calendar events
// come from real OAuth integrations — see lib/integrations/*.

export type Priority = "P1" | "P2" | "P3";

export type Task = {
  id: string;
  title: string;
  project: string;
  priority: Priority;
  due: string;
  done: boolean;
  tags: string[];
  estMinutes?: number;
};

export const recoveryTrend = [
  { day: "Mon", sleep: 7.2, hrv: 64, readiness: 78 },
  { day: "Tue", sleep: 6.4, hrv: 58, readiness: 66 },
  { day: "Wed", sleep: 7.9, hrv: 71, readiness: 84 },
  { day: "Thu", sleep: 6.1, hrv: 55, readiness: 61 },
  { day: "Fri", sleep: 8.1, hrv: 74, readiness: 88 },
  { day: "Sat", sleep: 8.4, hrv: 76, readiness: 91 },
  { day: "Sun", sleep: 7.6, hrv: 70, readiness: 83 },
];

export const sleepConsistency = [
  { day: "Mon", bed: 23.5, wake: 7.0 },
  { day: "Tue", bed: 24.2, wake: 7.0 },
  { day: "Wed", bed: 23.0, wake: 6.5 },
  { day: "Thu", bed: 24.8, wake: 7.2 },
  { day: "Fri", bed: 22.7, wake: 6.7 },
  { day: "Sat", bed: 23.2, wake: 7.3 },
  { day: "Sun", bed: 23.1, wake: 6.8 },
];

export const lifeBalance = [
  { axis: "Research", value: 88, target: 80 },
  { axis: "Health", value: 76, target: 75 },
  { axis: "Sleep", value: 82, target: 85 },
  { axis: "Fitness", value: 71, target: 70 },
  { axis: "Finance", value: 64, target: 70 },
  { axis: "Social", value: 48, target: 60 },
  { axis: "Personal", value: 70, target: 70 },
  { axis: "Recovery", value: 80, target: 80 },
];

export const researchProjects = [
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
];

export const cashflow = [
  { month: "Jan", income: 2680, expenses: 2050 },
  { month: "Feb", income: 2710, expenses: 2210 },
  { month: "Mar", income: 2980, expenses: 2380 },
  { month: "Apr", income: 3120, expenses: 2640 },
  { month: "May", income: 3340, expenses: 2480 },
];

export const spendingBreakdown = [
  { name: "Rent", value: 1100, color: "#5b8cff" },
  { name: "Food", value: 480, color: "#a78bfa" },
  { name: "Gas", value: 220, color: "#fbbf24" },
  { name: "Conference", value: 380, color: "#22d3ee" },
  { name: "Subscriptions", value: 86, color: "#34d399" },
  { name: "Other", value: 214, color: "#fb7185" },
];

export const cars = [
  {
    id: "audi-a5",
    name: "2012 Audi A5 Quattro",
    nickname: "Daily",
    mileage: 168_420,
    nextService: "Oil change",
    serviceIn: 480,
    health: 82,
    color: "blue",
    log: [
      { date: "Apr 12", item: "Brake pads — front", cost: 320 },
      { date: "Feb 02", item: "Winter tires on", cost: 60 },
      { date: "Nov 18", item: "Oil + filter", cost: 95 },
      { date: "Oct 04", item: "Coolant flush", cost: 140 },
    ],
  },
  {
    id: "audi-tt",
    name: "2001 Audi TT Roadster",
    nickname: "Weekend",
    mileage: 142_990,
    nextService: "Timing belt inspection",
    serviceIn: 1_200,
    health: 71,
    color: "violet",
    log: [
      { date: "Mar 09", item: "Soft top conditioner", cost: 28 },
      { date: "Sep 22", item: "Spark plugs", cost: 110 },
      { date: "Jul 14", item: "Battery", cost: 220 },
    ],
  },
];

export const lifeMilestones = [
  { date: "2023 · Sep", title: "Started MSc — Kinesiology", kind: "academic" },
  { date: "2024 · Apr", title: "First conference — CSEP poster", kind: "conference" },
  { date: "2024 · Aug", title: "MCAT 517", kind: "achievement" },
  { date: "2024 · Nov", title: "IAAO study — ethics approved", kind: "research" },
  { date: "2025 · Feb", title: "Transcontinental case study draft", kind: "research" },
  { date: "2025 · May", title: "Med school applications open", kind: "application" },
  { date: "2025 · Jul", title: "Lake District trip", kind: "trip" },
  { date: "2025 · Sep", title: "Thesis defense (target)", kind: "academic" },
  { date: "2026 · Aug", title: "Med school start (goal)", kind: "goal" },
];

export const aiInsights = [
  {
    tone: "warning",
    title: "3 cognitively intense days in a row",
    body: "Tomorrow is a good candidate for a deload — schedule lighter cognitive work and protect sleep.",
  },
  {
    tone: "info",
    title: "Thesis writing pace dropped 22% this week",
    body: "You averaged 38 min/day vs your 14-day baseline of 49 min. Consider a morning block before lab.",
  },
  {
    tone: "good",
    title: "Sleep consistency is at a 60-day high",
    body: "Bed time variance is ±28 min — keep this rhythm; recovery is trending up.",
  },
];

export const medApps = [
  { school: "McMaster MD", stage: "CASPer", progress: 45, deadline: "Oct 15" },
  { school: "U of T MD", stage: "Personal Statement", progress: 60, deadline: "Oct 02" },
  { school: "Western Schulich", stage: "Reference Letters", progress: 30, deadline: "Oct 02" },
  { school: "Queen's MD", stage: "Application Started", progress: 18, deadline: "Oct 02" },
  { school: "Ottawa MD", stage: "Profile Drafting", progress: 22, deadline: "Oct 02" },
];

export const journalEntries = [
  {
    date: "May 8",
    mood: 8,
    title: "Lab flow",
    body: "Participant 13 went smoothly. Felt sharp after the morning walk. Need to lock thesis Methods tomorrow before lab.",
  },
  {
    date: "May 7",
    mood: 6,
    title: "Slow start",
    body: "Slept poorly. Skipped gym, swapped for mobility. Reset on Wednesday.",
  },
  {
    date: "May 6",
    mood: 9,
    title: "Big writing block",
    body: "Wrote 1,200 words on Methods. Energy was peak. CASPer scenarios felt easier.",
  },
];
