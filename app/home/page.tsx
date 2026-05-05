"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Plus, Hash, Users, Compass, Bell, Settings } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/ui/BottomNav";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { GameCard } from "@/components/game/GameCard";
import { GENRES, GENRE_EMOJI, GENRE_GRADIENTS } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AuthGate>
      <Inner />
    </AuthGate>
  );
}

function Inner() {
  const user = useApp((s) => s.user)!;
  const games = useApp((s) => s.games);
  const trending = [...games].sort((a, b) => b.plays - a.plays).slice(0, 4);
  const fresh = [...games].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <main className="relative min-h-dvh">
      <div className="blob -top-40 -left-20 w-72 h-72 bg-[var(--primary)]" />
      <div className="blob -top-20 right-0 w-72 h-72 bg-[var(--violet)]" />

      <div className="mx-auto w-full max-w-[480px] px-5 pt-6 pb-bottom-nav relative">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-3">
            <Avatar emoji={user.avatar} color={user.color} size={42} ring />
            <div>
              <div className="text-xs text-text-muted">Hey there,</div>
              <div className="font-display font-semibold">{user.displayName}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center"
              aria-label="Profile"
            >
              <Settings className="size-5" />
            </Link>
            <button
              type="button"
              className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center relative"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-[var(--primary)]" />
            </button>
          </div>
        </div>

        {/* Hero CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 relative rounded-3xl p-5 overflow-hidden border border-white/10"
          style={{ background: "var(--grad-hero)" }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute inset-0 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-black/80">
              <Sparkles className="size-3.5" /> Quick start
            </div>
            <div className="mt-2 font-display text-2xl text-black font-bold leading-tight">
              Start a lobby<br />and prompt a game.
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href="/lobby?mode=create"
                className="bg-black text-white text-sm font-semibold rounded-full px-4 h-10 inline-flex items-center gap-1.5"
              >
                <Plus className="size-4" /> Create
              </Link>
              <Link
                href="/lobby?mode=join"
                className="bg-white/30 backdrop-blur-md text-black text-sm font-semibold rounded-full px-4 h-10 inline-flex items-center gap-1.5"
              >
                <Hash className="size-4" /> Join
              </Link>
              <Link
                href="/lobby?mode=match"
                className="bg-white/30 backdrop-blur-md text-black text-sm font-semibold rounded-full px-4 h-10 inline-flex items-center gap-1.5"
              >
                <Users className="size-4" /> Match
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Categories rail */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Categories</h2>
            <Link href="/browse" className="text-xs text-text-soft inline-flex items-center gap-1">
              View all <Compass className="size-3.5" />
            </Link>
          </div>
          <div className="-mx-5 px-5 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map((g) => (
              <Link
                key={g}
                href={`/browse?cat=${encodeURIComponent(g)}`}
                className="shrink-0 w-28 rounded-2xl p-3 border border-white/10 relative overflow-hidden"
                style={{ background: GENRE_GRADIENTS[g] }}
              >
                <div className="text-2xl">{GENRE_EMOJI[g]}</div>
                <div className="mt-2 text-xs font-bold text-black/85 leading-tight">{g}</div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-white/30 blur-xl" />
              </Link>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Trending now</h2>
            <Link href="/browse" className="text-xs text-text-soft">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {trending.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>

        {/* Fresh */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Fresh out the oven</h2>
            <Link href="/browse" className="text-xs text-text-soft">View all</Link>
          </div>
          <div className="space-y-2">
            {fresh.map((g) => (
              <GameCard key={g.id} game={g} variant="compact" />
            ))}
          </div>
        </section>

        <div className="mt-10 text-center text-xs text-text-muted">
          Your friend code: <span className="font-mono text-text">{user.friendCode}</span>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
