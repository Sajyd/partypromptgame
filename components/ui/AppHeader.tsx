"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: boolean | string;
  right?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function AppHeader({ title, subtitle, back, right, transparent, className }: Props) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        transparent ? "bg-transparent" : "bg-bg/80 backdrop-blur-xl border-b border-border-soft",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[480px] flex items-center gap-3 px-4 h-16">
        {back ? (
          typeof back === "string" ? (
            <Link
              href={back}
              className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
              aria-label="Back"
            >
              <ChevronLeft className="size-5" />
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
              aria-label="Back"
            >
              <ChevronLeft className="size-5" />
            </button>
          )
        ) : null}
        <div className="min-w-0 flex-1">
          {title ? (
            <div className="font-display text-lg font-semibold leading-none truncate">{title}</div>
          ) : null}
          {subtitle ? (
            <div className="text-xs text-text-muted mt-1 truncate">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>
    </header>
  );
}
