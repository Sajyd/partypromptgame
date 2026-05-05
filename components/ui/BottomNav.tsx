"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Compass, Sparkles, User } from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/lobby", label: "Create", icon: Sparkles, primary: true },
  { href: "/profile", label: "Me", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/12 bg-bg/95 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/88"
      aria-label="Primary"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto w-full max-w-[480px] px-3 pt-2 pb-2">
        <div className="flex items-stretch justify-between gap-1 rounded-2xl bg-surface-2/95 border border-white/14 px-1 py-1 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.85)]">
          {TABS.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/home" && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            if (tab.primary) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "relative flex min-h-12 flex-1 items-center justify-center rounded-xl outline-none transition-transform active:scale-[0.97]",
                    active && "ring-2 ring-[var(--primary)]/65 ring-offset-2 ring-offset-[var(--surface-2)]",
                  )}
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "h-11 w-11 rounded-2xl flex items-center justify-center text-black font-bold shadow-[0_10px_30px_-10px_rgba(255,77,168,0.65)]",
                      "[background:var(--grad-hero)]",
                      active && "brightness-110",
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-text-muted transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]",
                  active
                    ? "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    : "hover:bg-white/[0.06] hover:text-text-soft",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("size-5", active && "text-[var(--cyan)]")} />
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-none",
                    active ? "text-white" : "text-text-muted",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
