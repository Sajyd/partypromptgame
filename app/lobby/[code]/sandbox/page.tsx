"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sparkles, Send, History, Wand2, Eye, RotateCcw, Layers,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useApp, SELF_ID } from "@/lib/store";
import { TASK_EMOJI, TASK_TITLES } from "@/lib/mock-data";
import { GameCanvas } from "@/components/game/GameCanvas";
import { pickGameKind } from "@/lib/ai-mock";
import type { GameKind, TaskKind } from "@/lib/types";
import { cn, relTime } from "@/lib/utils";

const KIND_OPTIONS: TaskKind[] = ["mechanics", "world", "rules", "enemies", "items", "visuals", "audio"];

export default function SandboxPage() {
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
  const contributions = useApp((s) => s.contributions);
  const versions = useApp((s) => s.versions);
  const currentVersionId = useApp((s) => s.currentVersionId);
  const addContribution = useApp((s) => s.addContribution);
  const rollback = useApp((s) => s.rollbackToVersion);

  const [text, setText] = useState("");
  const [kind, setKind] = useState<TaskKind>("mechanics");
  const [showHistory, setShowHistory] = useState(false);
  const [previewKind, setPreviewKind] = useState<GameKind>("collect");
  const [hue, setHue] = useState(280);

  useEffect(() => {
    if (!lobby) router.replace("/lobby");
  }, [lobby, router]);

  // Auto-pick a kind based on idea
  useEffect(() => {
    if (!lobby) return;
    setPreviewKind(pickGameKind("Party", lobby.idea));
  }, [lobby]);

  if (!lobby) return null;

  const onSubmit = () => {
    if (!text.trim()) return;
    addContribution(text.trim(), kind);
    // hue jitter to feel like the game updated
    setHue((h) => (h + 30) % 360);
    setText("");
  };

  const onRemix = () => {
    setPreviewKind(prev => {
      const order: GameKind[] = ["platformer", "collect", "dodger", "maze", "arena"];
      const idx = order.indexOf(prev);
      return order[(idx + 1) % order.length];
    });
    setHue((h) => (h + 60) % 360);
  };

  const onGenerate = () => {
    router.push(`/lobby/${lobby.code}/generating?from=sandbox&kind=${previewKind}&hue=${hue}`);
  };

  const me = useApp.getState().user!;

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
            <div className="text-xs text-text-muted">Free sandbox</div>
            <div className="font-display font-semibold leading-none">
              Lobby {lobby.code}
            </div>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 relative"
            aria-label="History"
          >
            <History className="size-5" />
            {versions.length > 0 ? (
              <span className="absolute -top-1 -right-1 text-[10px] rounded-full bg-[var(--primary)] text-black w-4 h-4 grid place-items-center font-bold">
                {versions.length}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-4 py-4 pb-bottom-nav space-y-4">
        {/* Live preview */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-soft text-sm">
              <Eye className="size-4 text-[var(--cyan)]" /> Live preview
            </div>
            <div className="flex gap-2 items-center">
              <Badge color="#4df7ff">{previewKind}</Badge>
              <button onClick={onRemix} className="text-xs text-text-muted hover:text-text inline-flex items-center gap-1">
                <RotateCcw className="size-3.5" /> remix
              </button>
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden border border-border-soft bg-bg-soft relative">
            <GameCanvas kind={previewKind} hue={hue} />
          </div>
          <Button full size="lg" onClick={onGenerate}>
            <Wand2 className="size-4" /> Generate final game
          </Button>
        </section>

        {/* Prompt input */}
        <section className="rounded-3xl border border-border-soft bg-surface/60 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar emoji={me.avatar} color={me.color} size={32} />
            <div className="text-sm font-medium">Add a prompt</div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {KIND_OPTIONS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border inline-flex items-center gap-1.5 transition",
                  kind === k
                    ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
                    : "border-border-soft bg-surface/40 text-text-soft",
                )}
              >
                <span>{TASK_EMOJI[k]}</span>
                {TASK_TITLES[k]}
              </button>
            ))}
          </div>
          <Textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a double jump that triggers fireworks…"
          />
          <div className="flex gap-2">
            <Button variant="soft" size="md" onClick={() => setText("")}>Clear</Button>
            <Button full size="md" disabled={!text.trim()} onClick={onSubmit}>
              <Send className="size-4" /> Apply change
            </Button>
          </div>
        </section>

        {/* Live feed */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Live changes</h2>
            <span className="text-xs text-text-muted">
              {contributions.length} edits
            </span>
          </div>
          {contributions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-text-muted">
              <Sparkles className="mx-auto size-6 text-[var(--cyan)] mb-2" />
              First prompt unlocks the game.<br />Try “tap to throw confetti”.
            </div>
          ) : (
            <div className="space-y-2">
              {[...contributions].reverse().map((c) => (
                <div key={c.id} className="rounded-2xl border border-border-soft bg-surface/60 p-3">
                  <div className="flex items-center gap-2 text-xs text-text-soft">
                    <span className="size-2 rounded-full" style={{ background: c.authorColor }} />
                    <span className="font-semibold" style={{ color: c.authorColor }}>{c.authorName}</span>
                    <span className="text-text-muted">·</span>
                    <span className="text-text-muted">{relTime(c.ts)}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-widest text-text-muted">
                      {TASK_EMOJI[c.taskKind as TaskKind] ?? "✏️"} {c.taskKind === "edit" ? "edit" : TASK_TITLES[c.taskKind as TaskKind] ?? "edit"}
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm">{c.text}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showHistory ? (
        <HistorySheet
          onClose={() => setShowHistory(false)}
          versions={versions}
          currentId={currentVersionId}
          onRollback={(id) => {
            rollback(id);
            setShowHistory(false);
          }}
        />
      ) : null}
    </main>
  );
}

function HistorySheet({
  onClose,
  versions,
  currentId,
  onRollback,
}: {
  onClose: () => void;
  versions: ReturnType<typeof useApp.getState>["versions"];
  currentId: string | null;
  onRollback: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[480px] bg-surface border-t border-border-soft rounded-t-3xl p-5 max-h-[80dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-semibold flex items-center gap-2">
            <Layers className="size-4 text-[var(--cyan)]" /> Version history
          </div>
          <button onClick={onClose} className="text-sm text-text-muted">Close</button>
        </div>
        {versions.length === 0 ? (
          <div className="text-center text-sm text-text-muted py-12">
            No versions yet. Add a prompt to start.
          </div>
        ) : (
          <ol className="space-y-2 overflow-auto pr-1">
            {[...versions].reverse().map((v, i) => (
              <li
                key={v.id}
                className={cn(
                  "rounded-2xl border p-3 flex items-start gap-3",
                  v.id === currentId
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-border-soft bg-surface-2/40",
                )}
              >
                <div className="size-8 rounded-xl bg-white/5 grid place-items-center text-xs font-bold">
                  v{versions.length - i}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{v.summary}</div>
                  <div className="text-xs text-text-muted">
                    by {v.authorName} · {relTime(v.createdAt)}
                  </div>
                </div>
                {v.id !== currentId ? (
                  <Button size="sm" variant="soft" onClick={() => onRollback(v.id)}>
                    <RotateCcw className="size-3.5" /> Restore
                  </Button>
                ) : (
                  <Badge color="#4df7ff">live</Badge>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
