"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mic, MicOff, Headphones, HeadphoneOff, Users, Copy, Check, Wand2, Sparkles, Volume2, Plus, Send, X,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/Button";
import { useApp, SELF_ID } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { MOCK_PLAYERS } from "@/lib/mock-data";
import type { LobbyPlayer } from "@/lib/types";

export default function LobbyRoomPage() {
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
  const user = useApp((s) => s.user);
  const chat = useApp((s) => s.chat);
  const sendChat = useApp((s) => s.sendChat);
  const addSystemChat = useApp((s) => s.addSystemChat);
  const toggleVoice = useApp((s) => s.toggleVoice);
  const togglePlayerMute = useApp((s) => s.togglePlayerMute);
  const patchLobby = useApp((s) => s.patchLobby);
  const setMode = useApp((s) => s.setMode);
  const leaveLobby = useApp((s) => s.leaveLobby);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync URL code -> if no lobby exists, kick back to hub
  useEffect(() => {
    if (!lobby || lobby.code.toUpperCase() !== (params.code as string)?.toUpperCase()) {
      router.replace("/lobby");
    }
  }, [lobby, params.code, router]);

  if (!lobby || !user) return null;

  const isHost = lobby.players.find((p) => p.id === SELF_ID)?.isHost;
  const fullness = lobby.players.length;

  const onAddBot = () => {
    const taken = new Set(lobby.players.map((p) => p.id));
    const next = MOCK_PLAYERS.find((p) => !taken.has(p.id));
    if (!next || lobby.players.length >= 8) return;
    const newPlayer: LobbyPlayer = {
      id: next.id,
      displayName: next.displayName,
      avatar: next.avatar,
      color: next.color,
      status: "ready",
    };
    patchLobby({ players: [...lobby.players, newPlayer] });
    addSystemChat(`${next.displayName} joined the party.`);
  };

  const onCopy = () => {
    navigator.clipboard?.writeText(lobby.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onLeave = () => {
    leaveLobby();
    router.replace("/home");
  };

  const onPickMode = (mode: "challenge" | "sandbox") => {
    setMode(mode);
    addSystemChat(mode === "challenge" ? "Timed Challenge mode unlocked. ⏱️" : "Free Sandbox mode unlocked. 🌈");
    router.push(`/lobby/${lobby.code}/${mode}`);
  };

  return (
    <main className="min-h-dvh relative">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--violet)]" />
      <div className="blob -top-10 right-0 w-72 h-72 bg-[var(--cyan)]" />

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-bg/70 border-b border-border-soft">
        <div className="mx-auto w-full max-w-[480px] px-4 h-16 flex items-center gap-3">
          <button
            onClick={onLeave}
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label="Leave"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-text-muted">Lobby code</div>
            <button onClick={onCopy} className="font-display font-bold tracking-[0.3em] inline-flex items-center gap-2">
              {lobby.code}
              {copied ? <Check className="size-4 text-[var(--lime)]" /> : <Copy className="size-3.5 text-text-muted" />}
            </button>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs inline-flex items-center gap-1">
            <Users className="size-3.5" /> {fullness}/8
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-4 pb-bottom-nav pt-4 space-y-5">
        {/* Players grid */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Players</h2>
            <button
              onClick={onAddBot}
              className="text-xs text-[var(--cyan)] inline-flex items-center gap-1"
              disabled={lobby.players.length >= 8}
            >
              <Plus className="size-4" /> Add bot
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const p = lobby.players[i];
              if (!p) return <EmptySlot key={i} />;
              return (
                <PlayerTile
                  key={p.id}
                  p={p}
                  self={p.id === SELF_ID}
                  voiceEnabled={lobby.voiceEnabled}
                  onMute={() => togglePlayerMute(p.id)}
                />
              );
            })}
          </div>
        </section>

        {/* Voice + chat controls */}
        <section className="rounded-3xl border border-border-soft bg-surface/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-2xl grid place-items-center", lobby.voiceEnabled ? "bg-[var(--lime)]/20 text-[var(--lime)]" : "bg-white/5 text-text-muted")}>
                <Volume2 className="size-5" />
              </div>
              <div>
                <div className="font-semibold">Voice chat</div>
                <div className="text-xs text-text-muted">
                  {lobby.voiceEnabled ? "Live · room is open" : "Off"}
                </div>
              </div>
            </div>
            <Button
              variant={lobby.voiceEnabled ? "soft" : "primary"}
              size="md"
              onClick={toggleVoice}
            >
              {lobby.voiceEnabled ? "Leave voice" : "Join voice"}
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button
              variant="soft"
              size="md"
              full
              onClick={() => {
                const me = lobby.players.find((p) => p.id === SELF_ID);
                if (!me) return;
                togglePlayerMute(SELF_ID);
              }}
            >
              {lobby.players.find((p) => p.id === SELF_ID)?.isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {lobby.players.find((p) => p.id === SELF_ID)?.isMuted ? "Muted" : "Mic"}
            </Button>
            <Button
              variant="soft"
              size="md"
              full
              onClick={() => patchLobby({ players: lobby.players.map((p) => p.id === SELF_ID ? { ...p, isDeafened: !p.isDeafened } : p) })}
            >
              {lobby.players.find((p) => p.id === SELF_ID)?.isDeafened ? <HeadphoneOff className="size-4" /> : <Headphones className="size-4" />}
              {lobby.players.find((p) => p.id === SELF_ID)?.isDeafened ? "Deafened" : "Listen"}
            </Button>
            <Button variant="soft" size="md" full onClick={() => setChatOpen(true)}>
              <Send className="size-4" /> Chat
            </Button>
          </div>
        </section>

        {/* Modes */}
        <section>
          <h2 className="font-display font-semibold mb-2">Pick a mode</h2>
          <div className="grid grid-cols-1 gap-3">
            <ModeCard
              gradient="var(--grad-hero)"
              title="Timed Prompt Challenge"
              desc="AI dishes out tasks. You each prompt one part. Ship in 5 minutes."
              emoji="⏱️"
              points={["AI splits the work", "Timer keeps it spicy", "Built-in chaos"]}
              cta={isHost ? "Start challenge" : "Wait for host"}
              disabled={!isHost}
              onClick={() => onPickMode("challenge")}
            />
            <ModeCard
              gradient="var(--grad-cool)"
              title="Free Sandbox"
              desc="No timer. Anyone prompts changes. Live preview. Version history."
              emoji="🌈"
              points={["Everyone edits live", "Roll back anytime", "Made for late nights"]}
              cta={isHost ? "Open sandbox" : "Wait for host"}
              disabled={!isHost}
              onClick={() => onPickMode("sandbox")}
            />
          </div>
        </section>

        {/* Invite card */}
        <section className="rounded-3xl border border-border-soft bg-surface/60 p-4">
          <div className="font-semibold">Invite friends</div>
          <div className="text-sm text-text-muted mt-1">
            Share the code or send the invite link.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onCopy}
              className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 px-3 inline-flex items-center justify-between font-mono tracking-[0.4em]"
            >
              <span>{lobby.code}</span>
              {copied ? <Check className="size-4 text-[var(--lime)]" /> : <Copy className="size-4 text-text-muted" />}
            </button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                const url = typeof window !== "undefined" ? `${window.location.origin}/lobby?mode=join&c=${lobby.code}` : `?c=${lobby.code}`;
                navigator.clipboard?.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              Copy link
            </Button>
          </div>
        </section>
      </div>

      {/* Chat sheet */}
      {chatOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end" onClick={() => setChatOpen(false)}>
          <div
            className="mx-auto w-full max-w-[480px] bg-surface border-t border-border-soft rounded-t-3xl p-4 max-h-[80dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-semibold">Lobby chat</div>
              <button onClick={() => setChatOpen(false)} className="size-9 rounded-2xl bg-white/5 grid place-items-center"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-auto space-y-2 pr-1">
              {chat.map((m) => (
                <ChatBubble key={m.id} message={m} self={m.authorId === SELF_ID} />
              ))}
              {chat.length === 0 ? (
                <div className="text-center text-sm text-text-muted py-8">Say hi 👋</div>
              ) : null}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatText.trim()) return;
                sendChat(chatText);
                setChatText("");
              }}
            >
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 h-12 rounded-2xl bg-surface-2 border border-border-soft px-4"
                placeholder="Type a message"
              />
              <Button type="submit" size="lg" disabled={!chatText.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function EmptySlot() {
  return (
    <div className="aspect-square rounded-2xl border border-dashed border-white/10 grid place-items-center text-text-muted">
      <Plus className="size-5 opacity-50" />
    </div>
  );
}

function PlayerTile({
  p,
  self,
  voiceEnabled,
  onMute,
}: {
  p: LobbyPlayer;
  self: boolean;
  voiceEnabled: boolean;
  onMute: () => void;
}) {
  return (
    <div className="aspect-square rounded-2xl bg-surface/70 border border-border-soft p-2 flex flex-col items-center justify-center gap-1.5 relative">
      <Avatar emoji={p.avatar} color={p.color} size={42} ring={voiceEnabled && !p.isMuted} />
      <div className="text-xs font-semibold leading-none truncate w-full text-center">{p.displayName}</div>
      <div className="flex items-center gap-1">
        {p.isHost && <span className="text-[10px] px-1.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)]">Host</span>}
        {self && <span className="text-[10px] px-1.5 rounded-full bg-[var(--cyan)]/20 text-[var(--cyan)]">You</span>}
      </div>
      {voiceEnabled ? (
        <button
          onClick={onMute}
          className={cn(
            "absolute top-1.5 right-1.5 size-7 grid place-items-center rounded-full",
            p.isMuted ? "bg-[var(--danger)]/30 text-[var(--danger)]" : "bg-[var(--lime)]/20 text-[var(--lime)]",
          )}
        >
          {p.isMuted ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
        </button>
      ) : null}
    </div>
  );
}

function ModeCard({
  gradient,
  title,
  desc,
  emoji,
  points,
  cta,
  disabled,
  onClick,
}: {
  gradient: string;
  title: string;
  desc: string;
  emoji: string;
  points: string[];
  cta: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left rounded-3xl p-5 border border-white/10 relative overflow-hidden disabled:opacity-70"
      style={{ background: gradient }}
    >
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
      <div className="relative text-black">
        <div className="text-3xl">{emoji}</div>
        <div className="mt-2 font-display text-xl font-bold">{title}</div>
        <div className="text-sm text-black/80 mt-1">{desc}</div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {points.map((p) => (
            <li key={p} className="text-[11px] font-bold uppercase tracking-wide bg-black/15 rounded-full px-2 py-1">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-4 inline-flex items-center gap-1 bg-black text-white text-sm font-semibold rounded-full px-4 h-10">
          {cta} <Wand2 className="size-4" />
        </div>
      </div>
    </motion.button>
  );
}

function ChatBubble({ message, self }: { message: ReturnType<typeof useApp.getState>["chat"][number]; self: boolean }) {
  if (message.system) {
    return (
      <div className="text-center text-xs text-text-muted py-1">
        <Sparkles className="inline size-3 mr-1 text-[var(--cyan)]" /> {message.text}
      </div>
    );
  }
  return (
    <div className={cn("flex gap-2", self && "flex-row-reverse")}>
      <Avatar emoji={message.authorAvatar} color={message.authorColor} size={28} />
      <div className={cn("max-w-[80%]", self && "items-end")}>
        <div className="text-[11px] text-text-muted mb-0.5">{message.authorName}</div>
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm",
            self ? "bg-[var(--primary)]/20 text-white" : "bg-white/5 text-text",
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
