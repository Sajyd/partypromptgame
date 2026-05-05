"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Search, Sparkles, X, Heart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { Input } from "@/components/ui/Input";
import { GameCard } from "@/components/game/GameCard";
import { useApp } from "@/lib/store";
import { GENRES, GENRE_EMOJI } from "@/lib/mock-data";
import type { Genre } from "@/lib/types";
import { cn } from "@/lib/utils";

type Sort = "trending" | "fresh" | "top";

export default function BrowsePage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <BrowseInner />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <main className="min-h-dvh">
      <AppHeader title="Browse games" />
      <div className="mx-auto w-full max-w-[480px] px-5 py-4 pb-bottom-nav">
        <div className="h-12 rounded-2xl shimmer" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl shimmer" />
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function BrowseInner() {
  const games = useApp((s) => s.games);
  const favorites = useApp((s) => s.favorites);
  const search = useSearchParams();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Genre | null>(null);
  const [sort, setSort] = useState<Sort>("trending");
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    const c = search.get("cat") as Genre | null;
    if (c && GENRES.includes(c)) setCat(c);
  }, [search]);

  const filtered = useMemo(() => {
    let result = games;
    if (cat) result = result.filter((g) => g.category === cat);
    if (favOnly) result = result.filter((g) => favorites.includes(g.id));
    if (q.trim()) {
      const lower = q.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(lower) ||
          g.description.toLowerCase().includes(lower) ||
          g.tags.some((t) => t.toLowerCase().includes(lower)) ||
          g.creators.some((c) => c.name.toLowerCase().includes(lower)),
      );
    }
    if (sort === "trending") result = [...result].sort((a, b) => b.plays - a.plays);
    if (sort === "fresh") result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "top") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [games, cat, q, sort, favOnly, favorites]);

  return (
    <main className="min-h-dvh">
      <AppHeader title="Browse games" subtitle={`${filtered.length} games`} />
      <div className="mx-auto w-full max-w-[480px] px-5 py-4 pb-bottom-nav space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, tags, makers..."
            className="pl-10 pr-10 h-12"
          />
          {q ? (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white/10 grid place-items-center"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        {/* Categories rail */}
        <div className="-mx-5 px-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <Pill
            active={!cat}
            onClick={() => setCat(null)}
          >
            All
          </Pill>
          {GENRES.map((g) => (
            <Pill key={g} active={cat === g} onClick={() => setCat(g)}>
              <span className="mr-1">{GENRE_EMOJI[g]}</span> {g}
            </Pill>
          ))}
        </div>

        {/* Sort + filters */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 rounded-full bg-white/5 border border-white/10 p-1">
            {(["trending", "fresh", "top"] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "px-3 h-8 rounded-full text-xs font-semibold capitalize",
                  sort === s ? "bg-white/15 text-white" : "text-text-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFavOnly((v) => !v)}
            className={cn(
              "rounded-full px-3 h-8 inline-flex items-center gap-1 text-xs font-semibold border",
              favOnly
                ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
                : "border-white/10 bg-white/5 text-text-muted",
            )}
          >
            <Heart className={cn("size-3.5", favOnly && "fill-[var(--primary)] text-[var(--primary)]")} />
            Favorites
          </button>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <Sparkles className="size-6 mx-auto text-[var(--cyan)]" />
            <div className="mt-3 font-semibold">Nothing matches.</div>
            <div className="text-sm text-text-muted">Try a different category or search term.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((g) => (
              <GameCard key={g.id} game={g} variant="grid" />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 h-9 text-sm font-semibold border whitespace-nowrap",
        active
          ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
          : "border-border-soft bg-surface/40 text-text-soft",
      )}
    >
      {children}
    </button>
  );
}
