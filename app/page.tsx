"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Users, Wand2, Zap, Compass, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { APP_NAME } from "@/lib/brand";
import { useEffect, useState } from "react";

export default function Landing() {
  const user = useApp((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--primary)]" />
      <div className="blob -top-10 right-0 w-72 h-72 bg-[var(--violet)]" />
      <div className="blob bottom-0 left-1/3 w-72 h-72 bg-[var(--cyan)] opacity-30" />

      <div className="mx-auto w-full max-w-[480px] lg:max-w-5xl xl:max-w-6xl px-6 lg:px-10 xl:px-12 pt-12 lg:pt-16 pb-12 lg:pb-24 relative">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid place-items-center w-9 h-9 rounded-2xl [background:var(--grad-hero)] text-black">
              <Sparkles className="size-5" />
            </span>
            <span>{APP_NAME}</span>
          </div>
          <Link
            href="/browse"
            className="text-sm text-text-soft hover:text-text inline-flex items-center gap-1"
          >
            Browse <Compass className="size-4" />
          </Link>
        </div>

        <div className="mt-12 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,24rem)] lg:gap-x-14 xl:gap-x-20 lg:items-start">
          <div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[4.5rem] font-bold leading-[1.05] tracking-tight"
              >
                Build a tiny game{" "}
                <span className="gradient-text">together,</span>{" "}
                in 5 minutes.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-4 text-lg lg:text-xl text-text-soft max-w-xl lg:max-w-2xl"
              >
                Hop in a lobby. Each friend prompts a different part. The AI mashes it
                into a playable mini-game, and you all play it together.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 grid grid-cols-3 gap-2 lg:gap-3 lg:max-w-xl"
            >
              <Feature icon={<Users className="size-5" />} label="Up to 8 players" />
              <Feature icon={<Wand2 className="size-5" />} label="AI builds it" />
              <Feature icon={<Zap className="size-5" />} label="Play instantly" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row lg:flex-col xl:flex-row xl:flex-wrap gap-3 sm:gap-4 lg:max-w-xl xl:max-w-3xl"
            >
              {mounted && user ? (
                <>
                  <Link
                    href="/home"
                    className="h-14 px-6 inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-black [background:var(--grad-hero)] shadow-[0_10px_30px_-10px_rgba(255,77,168,0.55)]"
                  >
                    Continue as {user.displayName} <ArrowRight className="size-5" />
                  </Link>
                  <Link
                    href="/lobby"
                    className="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-2xl font-semibold bg-white/8 hover:bg-white/12 border border-white/10 text-text"
                  >
                    Start a new game
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="h-14 px-6 inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-black [background:var(--grad-hero)] shadow-[0_10px_30px_-10px_rgba(255,77,168,0.55)]"
                  >
                    Get started <ArrowRight className="size-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-2xl font-semibold bg-white/8 hover:bg-white/12 border border-white/10 text-text"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/browse"
                    className="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-2xl font-semibold bg-transparent hover:bg-white/5 border border-white/10 text-text-soft"
                  >
                    Browse community games
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 lg:mt-0 lg:sticky lg:top-10 lg:self-start"
          >
            <div className="text-xs uppercase tracking-widest text-text-muted mb-3">
              How it works
            </div>
            <ol className="space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-surface-2 border border-border-soft grid place-items-center font-bold text-text-soft">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-text-muted">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        <footer className="mt-16 lg:mt-20 flex flex-col items-center gap-3 text-center text-xs text-text-muted">
          <p>Made for 😂 with friends.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="Legal">
            <Link href="/privacy" className="hover:text-text-soft transition-colors">
              Privacy
            </Link>
            <span className="text-border-soft" aria-hidden>
              ·
            </span>
            <Link href="/terms" className="hover:text-text-soft transition-colors">
              Terms
            </Link>
            <span className="text-border-soft" aria-hidden>
              ·
            </span>
            <Link href="/privacy#notifications" className="hover:text-text-soft transition-colors">
              Push notifications
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-surface/50 border border-border-soft p-3 text-center">
      <div className="mx-auto w-9 h-9 rounded-xl grid place-items-center bg-white/5 border border-white/10 text-[var(--cyan)]">
        {icon}
      </div>
      <div className="mt-2 text-xs text-text-soft">{label}</div>
    </div>
  );
}

const STEPS = [
  { title: "Make a lobby", desc: "Invite friends with a link or join a public room." },
  { title: "Prompt your part", desc: "AI gives each player a piece — mechanics, world, enemies…" },
  { title: "Play immediately", desc: "AI stitches it together into a playable HTML5 game." },
  { title: "Laugh, rate, remix", desc: "Save the chaos. Share. Build a better one next round." },
];
