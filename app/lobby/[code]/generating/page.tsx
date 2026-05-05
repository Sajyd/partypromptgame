"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Cog, Loader2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useApp, SELF_ID } from "@/lib/store";
import { GENERATION_STEPS, generateFunnySummary, generateTitle, pickGameKind } from "@/lib/ai-mock";
import { GENRE_EMOJI, GENRES } from "@/lib/mock-data";
import { uid } from "@/lib/utils";
import type { GameKind, GeneratedGame, Genre } from "@/lib/types";

export default function GenerationPage() {
  return (
    <AuthGate>
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
    </AuthGate>
  );
}

function Inner() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const lobby = useApp((s) => s.lobby);
  const setGeneratedGame = useApp((s) => s.setGeneratedGame);
  const publishGame = useApp((s) => s.publishGame);
  const [step, setStep] = useState(0);

  const fromKind = (search.get("kind") as GameKind | null) ?? null;
  const fromHue = search.get("hue") ? parseInt(search.get("hue") as string) : null;

  useEffect(() => {
    if (!lobby) {
      router.replace("/lobby");
      return;
    }
    let mounted = true;
    let i = 0;
    const id = setInterval(() => {
      if (!mounted) return;
      i++;
      if (i >= GENERATION_STEPS.length) {
        clearInterval(id);
        finalize();
      } else {
        setStep(i);
      }
    }, 700);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finalize() {
    if (!lobby) return;
    const idea = lobby.idea || lobby.theme || "a tiny weird game";
    const genre = pickGenreFromIdea(idea, lobby);
    const kind: GameKind = fromKind ?? pickGameKind(genre, idea);
    const hue = fromHue ?? randomHue(genre);

    const contributions = collectContributions(lobby);
    const creators = uniqueCreators(lobby);

    const game: GeneratedGame = {
      id: uid("game"),
      title: generateTitle(idea),
      thumbnail: GENRE_EMOJI[genre] ?? "🎮",
      category: genre,
      kind,
      description: idea.length > 80 ? idea.slice(0, 80) + "…" : idea,
      tags: deriveTags(idea, genre),
      creators,
      rating: 0,
      ratingCount: 0,
      plays: 0,
      players: lobby.players.length,
      contributions,
      funnySummary: generateFunnySummary(genre),
      createdAt: Date.now(),
      hue,
    };
    setGeneratedGame(game);
    publishGame(game);
    setTimeout(() => router.replace(`/lobby/${lobby.code}/play`), 600);
  }

  return (
    <main className="min-h-dvh relative overflow-hidden">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--primary)]" />
      <div className="blob top-1/4 right-0 w-72 h-72 bg-[var(--violet)]" />
      <div className="blob bottom-0 left-1/3 w-72 h-72 bg-[var(--cyan)] opacity-30" />

      <div className="mx-auto w-full max-w-[480px] px-5 pt-20 pb-bottom-nav text-center">
        <div className="relative mx-auto w-32 h-32 grid place-items-center">
          <div className="absolute inset-0 rounded-full [background:var(--grad-hero)] opacity-40 blur-2xl" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, transparent, var(--primary), transparent)" }}
          />
          <div className="size-24 rounded-full grid place-items-center [background:var(--grad-hero)] text-black relative">
            <Sparkles className="size-10" />
          </div>
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold leading-tight">
          Building your game
        </h1>
        <p className="mt-2 text-text-soft">
          Stitching prompts. Sprinkling chaos.
        </p>

        <ol className="mt-8 mx-auto max-w-sm space-y-2 text-left">
          {GENERATION_STEPS.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl ${
                i < step
                  ? "bg-white/5 text-text-soft"
                  : i === step
                    ? "bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-text"
                    : "opacity-50 text-text-muted"
              }`}
            >
              <span className="shrink-0">
                {i < step ? (
                  <span className="size-5 rounded-full bg-[var(--lime)] text-black grid place-items-center text-xs font-bold">✓</span>
                ) : i === step ? (
                  <Loader2 className="size-5 animate-spin text-[var(--primary)]" />
                ) : (
                  <Cog className="size-5" />
                )}
              </span>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 text-xs text-text-muted inline-flex items-center gap-1">
          <Wand2 className="size-3.5 text-[var(--cyan)]" /> AI is being generously bad at art on purpose.
        </div>
      </div>
    </main>
  );
}

function pickGenreFromIdea(idea: string, lobby: NonNullable<ReturnType<typeof useApp.getState>["lobby"]>): Genre {
  const text = idea.toLowerCase();
  if (text.match(/race|drift|car/)) return "Racing";
  if (text.match(/scary|horror|ghost|spooky/)) return "Horror";
  if (text.match(/puzzle|riddle|maze/)) return "Puzzle";
  if (text.match(/survive|wave|defend/)) return "Survival";
  if (text.match(/shoot|laser|bullet/)) return "Shooter-lite";
  if (text.match(/jump|platform|hop/)) return "Platformer";
  if (text.match(/physics|bounce|ragdoll/)) return "Physics chaos";
  if (text.match(/quest|adventure|map/)) return "Adventure";
  if (text.match(/party|dance|confetti/)) return "Party";
  if (text.match(/weird|strange|experimental/)) return "Experimental";
  // Fallback to lobby's likely genre
  return GENRES[Math.floor(Math.random() * GENRES.length)];
}

function randomHue(genre: Genre) {
  const map: Record<Genre, number> = {
    "Platformer": 280,
    "Racing": 30,
    "Horror": 260,
    "Puzzle": 180,
    "Survival": 50,
    "Shooter-lite": 0,
    "Physics chaos": 320,
    "Adventure": 140,
    "Party": 340,
    "Experimental": 220,
  };
  return map[genre];
}

function deriveTags(idea: string, genre: Genre) {
  const stop = new Set(["the", "a", "and", "of", "to", "for", "in", "on", "with", "but", "you", "is", "are", "be"]);
  const words = idea
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3 && !stop.has(w))
    .slice(0, 4);
  return Array.from(new Set([genre.toLowerCase().split(" ")[0], ...words])).slice(0, 5);
}

function collectContributions(lobby: NonNullable<ReturnType<typeof useApp.getState>["lobby"]>): GeneratedGame["contributions"] {
  // Prefer task contributions; fallback to recorded contributions store
  const taskContribs = lobby.tasks
    .filter((t) => t.prompt)
    .map((t) => {
      const author = lobby.players.find((p) => p.id === t.assignee);
      return {
        author: author?.displayName ?? "?",
        authorColor: author?.color ?? "#9b5cff",
        part: capitalize(t.kind),
        text: t.prompt!,
      };
    });

  if (taskContribs.length > 0) return taskContribs;

  const sandboxContribs = useApp.getState().contributions;
  return sandboxContribs.map((c) => ({
    author: c.authorName,
    authorColor: c.authorColor,
    part: capitalize(c.taskKind === "edit" ? "edit" : c.taskKind),
    text: c.text,
  }));
}

function capitalize(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function uniqueCreators(lobby: NonNullable<ReturnType<typeof useApp.getState>["lobby"]>) {
  const map = new Map<string, GeneratedGame["creators"][number]>();
  for (const p of lobby.players) {
    map.set(p.id, {
      id: p.id === SELF_ID ? "self" : p.id,
      name: p.displayName,
      avatar: p.avatar,
      color: p.color,
    });
  }
  return [...map.values()].slice(0, 6);
}
