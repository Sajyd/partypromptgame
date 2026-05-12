import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-dvh">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--primary)] opacity-40" />
      <div className="blob -top-10 right-0 w-72 h-72 bg-[var(--violet)] opacity-40" />

      <div className="mx-auto w-full max-w-[640px] px-5 pt-6 pb-16 relative">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="inline-flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid place-items-center w-9 h-9 rounded-2xl [background:var(--grad-hero)] text-black">
              <Sparkles className="size-5" />
            </span>
            <span>{APP_NAME}</span>
          </div>
        </div>

        <header className="mt-10 border-b border-white/10 pb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">Last updated: {lastUpdated}</p>
        </header>

        <div className="mt-8 prose-legal">{children}</div>

        <footer className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-text-soft">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-soft">
            Terms
          </Link>
          <Link href="/privacy#notifications" className="hover:text-text-soft">
            Push notifications
          </Link>
          <Link href="/" className="hover:text-text-soft">
            Home
          </Link>
        </footer>
      </div>
    </main>
  );
}
