"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Star, RotateCcw, Save, Share2, Trophy, Repeat, Heart, Home,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GameThumb } from "@/components/game/GameThumb";
import { useApp, SELF_ID } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  return (
    <AuthGate>
      <Inner />
    </AuthGate>
  );
}

function Inner() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const lobby = useApp((s) => s.lobby);
  const game = useApp((s) => s.generatedGame);
  const publishGame = useApp((s) => s.publishGame);
  const leaveLobby = useApp((s) => s.leaveLobby);

  const [stars, setStars] = useState(0);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!lobby || !game) router.replace("/lobby");
  }, [lobby, game, router]);

  if (!lobby || !game) return null;

  const onPublish = () => {
    publishGame({
      ...game,
      ratingCount: game.ratingCount + 1,
      rating: stars > 0 ? stars : 4.4,
      plays: game.plays + 1,
    });
    setPublished(true);
  };

  const onSave = () => {
    publishGame({ ...game, plays: game.plays + 1 });
    setSaved(true);
  };

  const onReplay = () => router.push(`/lobby/${lobby.code}/play`);

  const onNewGame = () => {
    leaveLobby();
    router.replace("/lobby?mode=create");
  };

  return (
    <main className="min-h-dvh">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--primary)]" />
      <div className="blob top-1/4 right-0 w-72 h-72 bg-[var(--violet)]" />

      <div className="mx-auto w-full max-w-[480px] px-5 pt-6 pb-bottom-nav relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.replace("/home")}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Home className="size-5" />
          </button>
          <Badge color="#ffd14d" variant="soft">
            <Trophy className="size-3" /> Results
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <GameThumb game={game} size="lg" />
          <div className="mt-4 text-center">
            <div className="text-xs uppercase tracking-widest text-[var(--primary-2)] font-bold">
              {game.category}
            </div>
            <h1 className="font-display text-3xl font-bold mt-1 leading-tight">
              {game.title}
            </h1>
            <p className="text-text-soft mt-1">{game.description}</p>
          </div>
        </motion.div>

        {/* Funny summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 rounded-3xl border border-white/10 p-5 [background:var(--grad-cool)] text-black relative overflow-hidden"
        >
          <Sparkles className="size-5 absolute top-3 right-3 opacity-60" />
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">
            AI verdict
          </div>
          <p className="mt-2 font-display text-xl leading-snug font-semibold">
            “{game.funnySummary}”
          </p>
        </motion.div>

        {/* Rating */}
        <section className="mt-6 rounded-3xl border border-border-soft bg-surface/60 p-5">
          <div className="font-display font-semibold">Rate the chaos</div>
          <div className="text-sm text-text-muted">Your vote helps surface the best stuff.</div>
          <div className="mt-3 flex items-center gap-1.5 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                className={cn(
                  "h-12 w-12 grid place-items-center rounded-2xl bg-white/5 transition",
                  stars >= n && "bg-[var(--gold)]/20",
                )}
                aria-label={`${n} star`}
              >
                <Star
                  className={cn(
                    "size-7 transition",
                    stars >= n ? "fill-[var(--gold)] text-[var(--gold)]" : "text-text-muted",
                  )}
                />
              </button>
            ))}
          </div>
        </section>

        {/* Credits */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Credits</h2>
            <Badge color="#9b5cff">{game.creators.length} creators</Badge>
          </div>
          <div className="space-y-2">
            {game.contributions.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border-soft bg-surface/60 p-3 flex items-start gap-3"
              >
                <div
                  className="size-10 rounded-full grid place-items-center text-sm font-bold"
                  style={{ background: `${c.authorColor}22`, border: `1px solid ${c.authorColor}66`, color: c.authorColor }}
                >
                  {c.author[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-text-muted">{c.part}</div>
                  <div className="text-sm font-semibold" style={{ color: c.authorColor }}>{c.author}</div>
                  <div className="text-sm text-text-soft">“{c.text}”</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="mt-6 grid grid-cols-3 gap-2">
          <ActionBtn onClick={onReplay} label="Replay" icon={<RotateCcw className="size-5" />} />
          <ActionBtn
            onClick={onSave}
            label={saved ? "Saved" : "Save"}
            icon={<Save className="size-5" />}
            active={saved}
          />
          <ActionBtn
            onClick={() => navigator.share?.({ title: game.title, text: game.funnySummary }).catch(() => {})}
            label="Share"
            icon={<Share2 className="size-5" />}
          />
        </section>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <Button full size="xl" onClick={onPublish} disabled={published}>
            {published ? <><Heart className="size-5" /> Published</> : <><Sparkles className="size-5" /> Publish to Browse</>}
          </Button>
          <Button full size="lg" variant="soft" onClick={onNewGame}>
            <Repeat className="size-5" /> Make another
          </Button>
        </div>
      </div>
    </main>
  );
}

function ActionBtn({
  onClick,
  label,
  icon,
  active,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-3 flex flex-col items-center gap-1 text-xs font-semibold transition",
        active
          ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
          : "border-border-soft bg-surface/60 hover:bg-surface-2",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
