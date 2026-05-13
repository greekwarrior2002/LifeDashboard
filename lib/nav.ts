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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  keywords: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Mission Control", icon: Home, badge: "Live", keywords: "home dashboard mission control briefing" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, keywords: "calendar events schedule google" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, keywords: "tasks priorities todo" },
  { href: "/research", label: "Research", icon: FlaskConical, keywords: "research lab manuscript publications deadlines" },
  { href: "/health", label: "Health", icon: HeartPulse, keywords: "health recovery sleep hrv apple steps" },
  { href: "/finance", label: "Finance", icon: Wallet, keywords: "finance money cash spend savings subscriptions" },
  { href: "/cars", label: "Cars", icon: Car, keywords: "cars garage audi service mileage" },
  { href: "/applications", label: "Applications", icon: GraduationCap, keywords: "applications med school cycle" },
  { href: "/timeline", label: "Timeline", icon: Clock, keywords: "timeline life milestones" },
  { href: "/journal", label: "Journal", icon: NotebookPen, keywords: "journal mood reflection diary" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, keywords: "analytics balance heatmap insights" },
  { href: "/settings", label: "Settings", icon: Settings, keywords: "settings integrations profile cards" },
];

export const bottomNavHrefs = ["/", "/calendar", "/tasks", "/health"] as const;
