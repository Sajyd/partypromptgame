"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FormLabel } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useApp } from "@/lib/store";
import { AVATARS, COLORS, GENRES } from "@/lib/mock-data";
import type { Genre, PlayStyle, SkillLevel } from "@/lib/types";
import { cn, randomCode, uid } from "@/lib/utils";

const STEPS = ["name", "age", "avatar", "playstyle", "skill", "genres", "done"] as const;
type StepId = (typeof STEPS)[number];

const PLAYSTYLES: Array<{
  id: PlayStyle;
  label: string;
  desc: string;
  emoji: string;
}> = [
  { id: "creative", label: "Creative", desc: "I love designing weird worlds", emoji: "🎨" },
  { id: "chaotic", label: "Chaotic", desc: "Make it explode, please", emoji: "💥" },
  { id: "strategic", label: "Strategic", desc: "I like a clean win condition", emoji: "♟️" },
  { id: "social", label: "Social", desc: "Just here to laugh with friends", emoji: "🎉" },
];

const SKILLS: Array<{
  id: SkillLevel;
  label: string;
  desc: string;
}> = [
  { id: "casual", label: "Casual", desc: "I just want to vibe" },
  { id: "regular", label: "Regular", desc: "I play a lot of indie stuff" },
  { id: "competitive", label: "Competitive", desc: "I play to win" },
];

export default function Onboarding() {
  const router = useRouter();
  const setUser = useApp((s) => s.setUser);
  const [step, setStep] = useState<StepId>("name");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("creative");
  const [skill, setSkill] = useState<SkillLevel>("casual");
  const [genres, setGenres] = useState<Genre[]>([]);

  const stepIndex = STEPS.indexOf(step);

  const next = () => {
    const nextStep = STEPS[stepIndex + 1];
    if (!nextStep) return;
    setStep(nextStep);
  };
  const back = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setStep(STEPS[stepIndex - 1]);
  };

  const finish = () => {
    setUser({
      id: uid("u"),
      displayName: name.trim() || "Player",
      age: parseInt(age) || 18,
      avatar,
      color,
      playStyle,
      skill,
      genres,
      friendCode: randomCode(8),
      joinedAt: Date.now(),
      stats: { gamesCreated: 0, gamesPlayed: 0, contributions: 0, likes: 0 },
    });
    router.replace("/home");
  };

  const canContinue = (() => {
    switch (step) {
      case "name":
        return name.trim().length >= 2;
      case "age":
        return /^\d+$/.test(age) && parseInt(age) >= 6 && parseInt(age) <= 99;
      case "avatar":
        return !!avatar;
      case "playstyle":
        return !!playStyle;
      case "skill":
        return !!skill;
      case "genres":
        return genres.length >= 1;
      default:
        return true;
    }
  })();

  return (
    <main className="relative min-h-dvh">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--primary)]" />
      <div className="blob -top-10 right-0 w-72 h-72 bg-[var(--violet)]" />

      <div className="mx-auto w-full max-w-[480px] px-5 pt-6 pb-bottom-nav relative">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Progress index={stepIndex} total={STEPS.length - 1} />
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {step === "name" && (
                <>
                  <Header
                    eyebrow="Welcome"
                    title="What's your display name?"
                    desc="It shows on your contributions in every game."
                  />
                  <div>
                    <FormLabel>Display name</FormLabel>
                    <Input
                      autoFocus
                      maxLength={18}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kira, Milo, Bagel..."
                      className="text-lg h-14"
                    />
                  </div>
                </>
              )}

              {step === "age" && (
                <>
                  <Header
                    eyebrow="Age"
                    title="How old are you?"
                    desc="So we can match you with players in your age range."
                  />
                  <div>
                    <FormLabel>Age</FormLabel>
                    <Input
                      autoFocus
                      type="number"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter your age"
                      className="text-lg h-14"
                    />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 flex gap-3">
                    <ShieldCheck className="size-5 text-[var(--cyan)] shrink-0 mt-0.5" />
                    <div className="text-sm text-text-soft">
                      <strong className="text-text">Safe play:</strong> we use age
                      to filter content and match you with people your age.
                    </div>
                  </div>
                </>
              )}

              {step === "avatar" && (
                <>
                  <Header
                    eyebrow="Avatar"
                    title="Pick your look"
                    desc="Choose an icon and a color. You can change this later."
                  />
                  <div className="flex justify-center">
                    <Avatar emoji={avatar} color={color} size={96} ring />
                  </div>
                  <div>
                    <FormLabel>Icon</FormLabel>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATARS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAvatar(a)}
                          className={cn(
                            "h-12 rounded-xl text-2xl bg-surface-2 border border-border-soft transition",
                            avatar === a &&
                              "border-[var(--primary)] bg-[var(--primary)]/10 scale-105",
                          )}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FormLabel>Color</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={cn(
                            "h-10 w-10 rounded-full border-2 transition",
                            color === c
                              ? "border-white scale-110"
                              : "border-white/10",
                          )}
                          style={{ background: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === "playstyle" && (
                <>
                  <Header
                    eyebrow="Play style"
                    title="How do you usually play?"
                    desc="Just for vibes, helps us match you with people you'll click with."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {PLAYSTYLES.map((p) => (
                      <SelectCard
                        key={p.id}
                        active={playStyle === p.id}
                        onClick={() => setPlayStyle(p.id)}
                        title={p.label}
                        desc={p.desc}
                        emoji={p.emoji}
                      />
                    ))}
                  </div>
                </>
              )}

              {step === "skill" && (
                <>
                  <Header
                    eyebrow="Skill"
                    title="How experienced are you?"
                    desc="Doesn't change much — but it helps us calibrate prompts."
                  />
                  <div className="space-y-3">
                    {SKILLS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSkill(s.id)}
                        className={cn(
                          "w-full text-left rounded-2xl border p-4 transition flex items-center gap-3",
                          skill === s.id
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-border-soft bg-surface/50",
                        )}
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{s.label}</div>
                          <div className="text-sm text-text-muted">{s.desc}</div>
                        </div>
                        {skill === s.id ? (
                          <span className="size-6 rounded-full grid place-items-center bg-[var(--primary)] text-black">
                            <Check className="size-4" />
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "genres" && (
                <>
                  <Header
                    eyebrow="Favorites"
                    title="Pick a few genres"
                    desc="Choose at least one. We'll surface games you'll enjoy."
                  />
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((g) => {
                      const active = genres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setGenres((cur) =>
                              cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g],
                            );
                          }}
                          className={cn(
                            "rounded-full px-4 py-2.5 border text-sm transition font-medium",
                            active
                              ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
                              : "border-border-soft bg-surface/50 text-text-soft",
                          )}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === "done" && (
                <>
                  <div className="flex justify-center">
                    <div className="size-24 rounded-full grid place-items-center [background:var(--grad-hero)] text-black">
                      <Sparkles className="size-10" />
                    </div>
                  </div>
                  <Header
                    eyebrow="Ready"
                    title={`Welcome, ${name || "Player"}!`}
                    desc="You're all set. Let's make some weird little games."
                  />
                  <div className="rounded-2xl bg-surface/60 border border-border-soft p-4 flex items-center gap-3">
                    <Avatar emoji={avatar} color={color} size={56} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{name}</div>
                      <div className="text-xs text-text-muted">
                        {playStyle} · {skill} · {genres.length} genres
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto w-full max-w-[480px] px-5 pb-5">
            {step === "done" ? (
              <Button full size="xl" onClick={finish}>
                Let's go <ArrowRight className="size-5" />
              </Button>
            ) : (
              <Button full size="xl" disabled={!canContinue} onClick={next}>
                Continue <ArrowRight className="size-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full [background:var(--grad-hero)]"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(8, (index / total) * 100)}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      />
    </div>
  );
}

function Header({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-[var(--primary-2)] font-semibold">
        {eyebrow}
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold leading-tight">{title}</h1>
      <p className="mt-2 text-text-soft">{desc}</p>
    </div>
  );
}

function SelectCard({
  active,
  onClick,
  title,
  desc,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 text-left border transition",
        active
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-border-soft bg-surface/50",
      )}
    >
      <div className="text-3xl">{emoji}</div>
      <div className="mt-2 font-semibold">{title}</div>
      <div className="text-xs text-text-muted">{desc}</div>
    </button>
  );
}
