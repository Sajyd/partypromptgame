"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Heart, Share2, Repeat, Star, Users, Clock, Sparkles, ArrowLeft,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GameThumb } from "@/components/game/GameThumb";
import { GameCanvas } from "@/components/game/GameCanvas";
import { useApp } from "@/lib/store";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { cn, relTime } from "@/lib/utils";

export default function GameDetailsPage() {
  return (
    <AuthGate>
      <Inner />
    </AuthGate>
  );
}

function Inner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const games = useApp((s) => s.games);
  const favorites = useApp((s) => s.favorites);
  const toggleFav = useApp((s) => s.toggleFavorite);
  const game = games.find((g) => g.id === params.id);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!game) router.replace("/browse");
  }, [game, router]);

  if (!game) return null;

  const isFav = favorites.includes(game.id);

  return (
    <main className="min-h-dvh">
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="mx-auto w-full max-w-[480px] px-4 pt-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => toggleFav(game.id)}
              className={cn(
                "h-10 w-10 inline-flex items-center justify-center rounded-2xl border",
                isFav
                  ? "bg-[var(--primary)]/30 text-white border-[var(--primary)]"
                  : "bg-black/40 backdrop-blur-xl border-white/10 text-white",
              )}
              aria-label="Favorite"
            >
              <Heart className={cn("size-5", isFav && "fill-current")} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: game.title, text: game.funnySummary }).catch(() => {})}
              className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10"
              aria-label="Share"
            >
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden">
          {playing ? (
            <GameCanvas kind={game.kind} hue={game.hue} className="rounded-none h-full" />
          ) : (
            <GameThumb game={game} size="lg" className="h-full !rounded-none" />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[480px] px-5 pb-bottom-nav -mt-8 relative">
        <Badge color="#9b5cff" variant="solid">{game.category}</Badge>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight">{game.title}</h1>
        <p className="mt-2 text-text-soft">{game.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {game.tags.map((t) => (
            <span key={t} className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-text-soft">
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat icon={<Star className="size-4 fill-[var(--gold)] text-[var(--gold)]" />} label="Rating" value={game.rating.toFixed(1)} />
          <Stat icon={<Users className="size-4 text-[var(--cyan)]" />} label="Players" value={game.players.toString()} />
          <Stat icon={<Clock className="size-4 text-[var(--violet)]" />} label="Created" value={relTime(game.createdAt)} />
        </div>

        <div className="mt-5 flex gap-2">
          <Button full size="xl" onClick={() => setPlaying(true)}>
            <Play className="size-5" /> {playing ? "Playing..." : "Play"}
          </Button>
          <Button variant="soft" size="xl" onClick={() => router.push("/lobby?mode=create")}>
            <Repeat className="size-5" /> Remix
          </Button>
        </div>

        {/* Funny summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl border border-white/10 p-4 [background:var(--grad-warm)] text-black relative overflow-hidden"
        >
          <Sparkles className="size-4 absolute top-3 right-3" />
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">AI verdict</div>
          <div className="mt-1 font-display font-bold text-lg leading-snug">
            “{game.funnySummary}”
          </div>
        </motion.div>

        {/* Creators */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Creators</h2>
            <AvatarStack
              items={game.creators.map((c) => ({ emoji: c.avatar, color: c.color, label: c.name }))}
              size={26}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {game.creators.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border-soft bg-surface/60 p-3 flex items-center gap-3">
                <Avatar emoji={c.avatar} color={c.color} size={36} />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-text-muted">creator</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Credits */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Made of these prompts</h2>
            <Badge color="#4df7ff">{game.contributions.length}</Badge>
          </div>
          <ul className="space-y-2">
            {game.contributions.map((c, i) => (
              <li key={i} className="rounded-2xl border border-border-soft bg-surface/60 p-3">
                <div className="text-[10px] uppercase tracking-widest text-text-muted">{c.part}</div>
                <div className="text-sm font-semibold" style={{ color: c.authorColor }}>{c.author}</div>
                <div className="text-sm text-text-soft mt-0.5">“{c.text}”</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-border-soft bg-surface/60 p-4">
          <div className="font-display font-semibold mb-1">Stats</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-text-muted text-xs">Plays</div>
              <div className="font-bold">{game.plays}</div>
            </div>
            <div>
              <div className="text-text-muted text-xs">Ratings</div>
              <div className="font-bold">{game.ratingCount}</div>
            </div>
            <div>
              <div className="text-text-muted text-xs">Score</div>
              <div className="font-bold">{game.rating.toFixed(1)}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface/60 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-xs text-text-muted">
        {icon} {label}
      </div>
      <div className="font-bold mt-0.5">{value}</div>
    </div>
  );
}
