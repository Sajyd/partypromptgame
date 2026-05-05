"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Wand2, Clock, Send, Check, RefreshCcw, Shuffle,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/Button";
import { Textarea, FormLabel, Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useApp, SELF_ID } from "@/lib/store";
import { SAMPLE_THEMES, TASK_EMOJI, TASK_HINTS, TASK_TITLES } from "@/lib/mock-data";
import { cn, formatTime } from "@/lib/utils";

type Stage = "idea" | "tasks" | "prompt" | "submitted";

export default function ChallengePage() {
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
  const setIdea = useApp((s) => s.setIdea);
  const setTheme = useApp((s) => s.setTheme);
  const assignAITasks = useApp((s) => s.assignAITasks);
  const submitTaskPrompt = useApp((s) => s.submitTaskPrompt);
  const startTimer = useApp((s) => s.startTimer);
  const decrementTimer = useApp((s) => s.decrementTimer);
  const reassignTask = useApp((s) => s.reassignTask);

  const [stage, setStage] = useState<Stage>("idea");
  const [ideaDraft, setIdeaDraft] = useState(lobby?.idea ?? "");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!lobby) router.replace("/lobby");
  }, [lobby, router]);

  // Determine starting stage based on lobby state
  useEffect(() => {
    if (!lobby) return;
    if (lobby.tasks.length > 0 && stage === "idea") setStage("tasks");
  }, [lobby, stage]);

  // Timer ticker
  useEffect(() => {
    if (!lobby?.timer) return;
    const t = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(t);
  }, [lobby?.timer, decrementTimer]);

  const myTask = useMemo(() => {
    return lobby?.tasks.find((t) => t.assignee === SELF_ID) ?? null;
  }, [lobby]);

  if (!lobby) return null;

  const allSubmitted = lobby.tasks.length > 0 && lobby.tasks.every((t) => !!t.prompt);
  const submittedCount = lobby.tasks.filter((t) => !!t.prompt).length;

  const onPickTheme = (t: string) => setIdeaDraft((cur) => (cur ? cur : t));

  const onAssign = () => {
    setIdea(ideaDraft);
    assignAITasks();
    startTimer(180);
    setStage("tasks");
  };

  const onSubmit = (taskId: string, prompt: string) => {
    submitTaskPrompt(taskId, prompt);
    setActiveTaskId(null);
    setStage("submitted");
  };

  const onSimulateOthers = () => {
    if (!lobby) return;
    const samplePrompts: Record<string, string> = {
      mechanics: "tap to jump, hold to glide on tiny umbrella",
      world: "rooftop park at sunset, fairy lights everywhere",
      rules: "collect all sandwiches before the seagulls eat them",
      enemies: "hangry seagulls and one VERY committed pigeon",
      items: "soda powerup that makes you bounce",
      visuals: "lo-poly with chunky pastels and a fish-eye lens",
      audio: "lo-fi guitar with seagull samples",
    };
    for (const t of lobby.tasks) {
      if (!t.prompt && t.assignee !== SELF_ID) {
        submitTaskPrompt(t.id, samplePrompts[t.kind] ?? "make it fun");
      }
    }
  };

  const onGenerate = () => {
    if (!allSubmitted) return;
    setGenerating(true);
    router.push(`/lobby/${lobby.code}/generating`);
  };

  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-bg/70 border-b border-border-soft">
        <div className="mx-auto w-full max-w-[480px] px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.push(`/lobby/${lobby.code}`)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <div className="text-xs text-text-muted">Timed challenge</div>
            <div className="font-display font-semibold leading-none">
              Lobby {lobby.code}
            </div>
          </div>
          {lobby.timer != null ? (
            <div className={cn(
              "px-3 h-9 rounded-full inline-flex items-center gap-1 font-mono font-bold text-sm",
              lobby.timer < 30 ? "bg-[var(--danger)]/20 text-[var(--danger)]" : "bg-white/5 text-text"
            )}>
              <Clock className="size-4" /> {formatTime(lobby.timer)}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-4 py-4 pb-bottom-nav">
        <AnimatePresence mode="wait">
          {stage === "idea" && (
            <motion.section
              key="idea"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="rounded-3xl p-5 border border-white/10 [background:var(--grad-hero)] text-black">
                <div className="text-xs uppercase tracking-widest font-bold flex items-center gap-1">
                  <Sparkles className="size-3.5" /> Step 1 of 3
                </div>
                <div className="font-display text-2xl font-bold mt-1">
                  What's the game about?
                </div>
                <div className="text-sm text-black/80 mt-1">
                  Brainstorm together. AI will use this to assign each player a part.
                </div>
              </div>

              <div>
                <FormLabel>Theme (optional)</FormLabel>
                <Input
                  value={lobby.theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Snacks gone rogue"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {SAMPLE_THEMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold border transition",
                        lobby.theme === t
                          ? "border-[var(--primary)] bg-[var(--primary)]/15"
                          : "border-border-soft bg-surface/40 text-text-soft",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    onClick={() => setTheme(SAMPLE_THEMES[Math.floor(Math.random() * SAMPLE_THEMES.length)])}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold border border-white/10 bg-white/5 text-text-soft inline-flex items-center gap-1"
                  >
                    <Shuffle className="size-3.5" /> Surprise
                  </button>
                </div>
              </div>

              <div>
                <FormLabel>The big idea</FormLabel>
                <Textarea
                  rows={5}
                  value={ideaDraft}
                  onChange={(e) => setIdeaDraft(e.target.value)}
                  placeholder="A platformer where you're a lonely toaster looking for love in a giant kitchen..."
                />
                <div className="text-xs text-text-muted mt-1">
                  Tip: be silly and specific. The AI loves both.
                </div>
              </div>

              <Button full size="xl" disabled={ideaDraft.trim().length < 6} onClick={onAssign}>
                <Wand2 className="size-5" /> Let AI deal the parts
              </Button>
            </motion.section>
          )}

          {(stage === "tasks" || stage === "submitted") && (
            <motion.section
              key="tasks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-3xl p-4 border border-border-soft bg-surface/60">
                <div className="text-xs text-text-muted uppercase tracking-widest font-semibold">
                  Big idea
                </div>
                <div className="mt-1 font-medium leading-snug">
                  {lobby.idea || lobby.theme || "Untitled chaos"}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold">AI task board</h2>
                <span className="text-xs text-text-muted">
                  {submittedCount}/{lobby.tasks.length} submitted
                </span>
              </div>

              <div className="space-y-3">
                {lobby.tasks.map((task, i) => {
                  const assignee = lobby.players.find((p) => p.id === task.assignee);
                  if (!assignee) return null;
                  const isMine = task.assignee === SELF_ID;
                  const submitted = !!task.prompt;
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "rounded-3xl border p-4",
                        isMine
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-border-soft bg-surface/60",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-12 rounded-2xl bg-white/5 grid place-items-center text-2xl">
                          {TASK_EMOJI[task.kind]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-widest text-text-muted">
                            {TASK_TITLES[task.kind]}
                          </div>
                          <div className="font-semibold leading-snug">{task.description}</div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-text-soft">
                            <Avatar emoji={assignee.avatar} color={assignee.color} size={20} />
                            <span>{assignee.displayName}</span>
                            {isMine && <Badge color="#ff4da8">You</Badge>}
                            {submitted && (
                              <span className="inline-flex items-center gap-1 text-[var(--lime)]">
                                <Check className="size-3.5" /> submitted
                              </span>
                            )}
                          </div>
                          {submitted && task.prompt ? (
                            <div className="mt-2 rounded-2xl bg-white/5 p-3 text-sm">
                              “{task.prompt}”
                            </div>
                          ) : null}
                          {isMine && !submitted ? (
                            <Button
                              className="mt-3"
                              size="md"
                              onClick={() => setActiveTaskId(task.id)}
                            >
                              <Wand2 className="size-4" /> Write your prompt
                            </Button>
                          ) : null}
                          {!isMine && !submitted ? (
                            <button
                              onClick={() => reassignTask(task.id, SELF_ID)}
                              className="mt-2 text-xs text-text-muted hover:text-text inline-flex items-center gap-1"
                            >
                              <RefreshCcw className="size-3.5" /> Steal this task
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="soft" size="md" onClick={onSimulateOthers}>
                  <Sparkles className="size-4" /> Simulate friends
                </Button>
                <Button
                  size="lg"
                  full
                  disabled={!allSubmitted || generating}
                  onClick={onGenerate}
                  loading={generating}
                >
                  Generate game <Wand2 className="size-4" />
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt sheet */}
      {activeTaskId ? (
        <PromptSheet
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          onSubmit={(text) => onSubmit(activeTaskId, text)}
        />
      ) : null}
    </main>
  );
}

function PromptSheet({
  taskId,
  onClose,
  onSubmit,
}: {
  taskId: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
}) {
  const lobby = useApp((s) => s.lobby);
  const task = lobby?.tasks.find((t) => t.id === taskId);
  const [text, setText] = useState(task?.prompt ?? "");

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[480px] bg-surface border-t border-border-soft rounded-t-3xl p-5 max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-2xl [background:var(--grad-hero)] grid place-items-center text-2xl">
              {TASK_EMOJI[task.kind]}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-text-muted">
                {TASK_TITLES[task.kind]}
              </div>
              <div className="font-display text-lg font-semibold leading-tight">
                {task.description}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-sm text-text-soft mb-3 flex gap-2">
          <Sparkles className="size-4 text-[var(--cyan)] shrink-0 mt-0.5" />
          <span>{task.hint}</span>
        </div>

        <FormLabel>Your prompt</FormLabel>
        <Textarea
          autoFocus
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={TASK_HINTS[task.kind]}
        />

        <div className="mt-4 flex gap-2">
          <Button variant="soft" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            full
            size="lg"
            disabled={text.trim().length < 4}
            onClick={() => onSubmit(text.trim())}
          >
            <Send className="size-4" /> Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
