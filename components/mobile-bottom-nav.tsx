"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { navItems, bottomNavHrefs } from "@/lib/nav";
import { useMobileNav } from "@/components/mobile-drawer";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const path = usePathname();
  const { setOpen } = useMobileNav();

  const tabs = bottomNavHrefs
    .map((href) => navItems.find((i) => i.href === href))
    .filter((i): i is (typeof navItems)[number] => Boolean(i));

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/[0.05] bg-ink-950/85 backdrop-blur-xl",
        "pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden",
      )}
      aria-label="Primary"
    >
      {tabs.map((item) => {
        const Active = path === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.14em] transition-colors",
              Active ? "text-white" : "text-muted hover:text-subtle",
            )}
            aria-current={Active ? "page" : undefined}
          >
            {Active ? (
              <span className="absolute top-0 h-[2px] w-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-violet shadow-glow" />
            ) : null}
            <Icon className={cn("h-5 w-5", Active ? "text-neon-blue" : "")} />
            <span>{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-subtle"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
        <span>More</span>
      </button>
    </nav>
  );
}
