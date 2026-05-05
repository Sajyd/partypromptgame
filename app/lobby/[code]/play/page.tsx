"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Pause, Play as PlayIcon, Trophy, ChevronRight } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { GameCanvas } from "@/components/game/GameCanvas";

export default function PlayPage() {
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
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [outcome, setOutcome] = useState<null | "won" | "lost">(null);
  const [activeContrib, setActiveContrib] = useState<number>(0);
  const [showCreditToast, setShowCreditToast] = useState(true);

  useEffect(() => {
    if (!lobby || !game) {
      router.replace("/lobby");
    }
  }, [lobby, game, router]);

  // Cycle credit highlights
  const credCount = game?.contributions.length ?? 0;
  useEffect(() => {
    if (!credCount) return;
    setShowCreditToast(true);
    const id = setInterval(() => {
      setActiveContrib((i) => (i + 1) % credCount);
      setShowCreditToast(false);
      requestAnimationFrame(() => setShowCreditToast(true));
    }, 5500);
    return () => clearInterval(id);
  }, [credCount]);

  if (!lobby || !game) return null;

  const onResults = () => router.push(`/lobby/${lobby.code}/results`);

  const credit = game.contributions[activeContrib];

  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-bg/70 border-b border-border-soft">
        <div className="mx-auto w-full max-w-[480px] px-4 h-16 flex items-center gap-3">
          <button
            onClick={onResults}
            className="h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 inline-flex items-center gap-1 text-sm"
          >
            End <ChevronRight className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-text-muted truncate">{game.category}</div>
            <div className="font-display font-semibold leading-none truncate">{game.title}</div>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? <PlayIcon className="size-5" /> : <Pause className="size-5" />}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-4 py-3 pb-bottom-nav space-y-3">
        <div className="aspect-[3/4] sm:aspect-[4/3] w-full rounded-3xl overflow-hidden border border-border-soft bg-bg-soft relative">
          <GameCanvas
            kind={game.kind}
            hue={game.hue}
            paused={paused}
            onScore={setScore}
            onWin={() => setOutcome("won")}
            onLose={() => setOutcome("lost")}
          />

          {/* Contributor toast inside the canvas frame */}
          <AnimatePresence mode="wait">
            {credit && showCreditToast ? (
              <motion.div
                key={`${activeContrib}-${credit.author}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 shadow">
                  <span className="size-7 rounded-full grid place-items-center text-sm" style={{ background: `${credit.authorColor}33`, border: `1px solid ${credit.authorColor}` }}>
                    <Sparkles className="size-3.5" style={{ color: credit.authorColor }} />
                  </span>
                  <div className="text-xs">
                    <div className="font-semibold text-white truncate max-w-[16rem]">
                      <span style={{ color: credit.authorColor }}>{credit.author}</span> {credit.part.toLowerCase()}
                    </div>
                    <div className="text-text-muted truncate max-w-[16rem]">“{credit.text}”</div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {paused ? (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm grid place-items-center">
              <Button onClick={() => setPaused(false)} size="xl">
                <PlayIcon className="size-5" /> Resume
              </Button>
            </div>
          ) : null}

          {outcome ? (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm grid place-items-center text-center px-4">
              <div className="space-y-3">
                <div className="text-6xl">{outcome === "won" ? "🏆" : "💥"}</div>
                <div className="font-display text-2xl font-bold">
                  {outcome === "won" ? "You won!" : "Better luck next time"}
                </div>
                <div className="text-sm text-text-soft">
                  Score: <span className="text-[var(--cyan)] font-bold">{score}</span>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="soft" size="lg" onClick={() => setOutcome(null)}>
                    <PlayIcon className="size-4" /> Replay
                  </Button>
                  <Button size="lg" onClick={onResults}>
                    See results <Trophy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <section className="rounded-3xl border border-border-soft bg-surface/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-semibold">Built by</div>
            <Badge color="#4df7ff">{game.contributions.length} parts</Badge>
          </div>
          <div className="space-y-2">
            {game.contributions.map((c, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-3 flex items-start gap-3 transition ${
                  i === activeContrib
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-border-soft bg-surface-2/40"
                }`}
                onClick={() => setActiveContrib(i)}
              >
                <div className="size-9 rounded-full grid place-items-center text-sm" style={{ background: `${c.authorColor}22`, border: `1px solid ${c.authorColor}` }}>
                  <span className="text-xs font-bold" style={{ color: c.authorColor }}>
                    {c.author[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-text-muted">{c.part}</div>
                  <div className="text-sm font-medium" style={{ color: c.authorColor }}>{c.author}</div>
                  <div className="text-sm text-text-soft truncate">“{c.text}”</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Button full size="xl" onClick={onResults}>
          End game <Trophy className="size-5" />
        </Button>
      </div>
    </main>
  );
}
