"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Hash, Globe, Loader2, Lock, ArrowRight } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { AppHeader } from "@/components/ui/AppHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input, FormLabel } from "@/components/ui/Input";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tab = "create" | "join" | "match";

export default function LobbyHubPage() {
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
  const params = useSearchParams();
  const initial = (params.get("mode") as Tab | null) ?? "create";
  const [tab, setTab] = useState<Tab>(initial);
  const [code, setCode] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [matching, setMatching] = useState(false);

  const createLobby = useApp((s) => s.createLobby);
  const joinLobby = useApp((s) => s.joinLobbyByCode);

  useEffect(() => {
    if (initial !== tab) setTab(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const onCreate = () => {
    const lobby = createLobby({ isPublic });
    router.push(`/lobby/${lobby.code}`);
  };

  const onJoin = () => {
    if (code.trim().length < 4) return;
    const lobby = joinLobby(code.trim());
    if (lobby) router.push(`/lobby/${lobby.code}`);
  };

  const onMatch = async () => {
    setMatching(true);
    await new Promise((r) => setTimeout(r, 1400));
    const lobby = useApp.getState().joinLobbyByCode("PUBLIC");
    setMatching(false);
    if (lobby) router.push(`/lobby/${lobby.code}`);
  };

  return (
    <main className="min-h-dvh">
      <AppHeader title="Play together" subtitle="Make a lobby or jump in" />
      <div className="mx-auto w-full max-w-[480px] px-5 py-4 pb-bottom-nav">
        <div className="grid grid-cols-3 gap-2 mb-5">
          <TabBtn active={tab === "create"} onClick={() => setTab("create")} icon={<Plus className="size-4" />}>
            Create
          </TabBtn>
          <TabBtn active={tab === "join"} onClick={() => setTab("join")} icon={<Hash className="size-4" />}>
            Join
          </TabBtn>
          <TabBtn active={tab === "match"} onClick={() => setTab("match")} icon={<Users className="size-4" />}>
            Match
          </TabBtn>
        </div>

        {tab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl p-5 border border-white/10 [background:var(--grad-cool)] text-black relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
              <div className="font-display text-xl font-bold">Make a private lobby</div>
              <p className="text-sm text-black/80 mt-1">
                Get a 6-letter code. Share it with friends. Up to 8 players.
              </p>
            </div>

            <div className="rounded-2xl border border-border-soft bg-surface/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {isPublic ? <Globe className="size-4 text-[var(--cyan)]" /> : <Lock className="size-4 text-text-muted" />}
                    {isPublic ? "Public lobby" : "Private lobby"}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {isPublic ? "Anyone can drop in via Match." : "Only people with the code can join."}
                  </div>
                </div>
                <Toggle checked={isPublic} onChange={setIsPublic} />
              </div>
            </div>

            <Button full size="xl" onClick={onCreate}>
              <Plus className="size-5" /> Create lobby
            </Button>
          </motion.div>
        )}

        {tab === "join" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl p-5 border border-white/10 [background:var(--grad-warm)] text-black relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
              <div className="font-display text-xl font-bold">Got a lobby code?</div>
              <p className="text-sm text-black/80 mt-1">
                Type the 6 letters from your friend's invite.
              </p>
            </div>

            <div>
              <FormLabel>Lobby code</FormLabel>
              <Input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                placeholder="ABC123"
                maxLength={6}
                className="h-14 text-center font-mono tracking-[0.5em] text-2xl"
              />
            </div>

            <Button full size="xl" disabled={code.trim().length < 4} onClick={onJoin}>
              Join lobby <ArrowRight className="size-5" />
            </Button>

            <div className="text-center text-xs text-text-muted">
              Or scan a QR code from a friend's screen.
            </div>
          </motion.div>
        )}

        {tab === "match" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl p-5 border border-white/10 [background:var(--grad-hero)] text-black relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
              <div className="font-display text-xl font-bold">Match with strangers</div>
              <p className="text-sm text-black/80 mt-1">
                We'll drop you into a public lobby with players your age.
              </p>
            </div>

            <div className="rounded-2xl border border-border-soft bg-surface/60 p-5 flex flex-col items-center text-center">
              {matching ? (
                <>
                  <div className="size-20 rounded-full grid place-items-center bg-white/5 border border-white/10 pulse-ring">
                    <Loader2 className="size-8 animate-spin text-[var(--cyan)]" />
                  </div>
                  <div className="mt-4 font-semibold">Searching…</div>
                  <div className="text-sm text-text-muted">Looking for a chill lobby for you</div>
                </>
              ) : (
                <>
                  <div className="size-20 rounded-full grid place-items-center bg-white/5 border border-white/10">
                    <Users className="size-8 text-[var(--cyan)]" />
                  </div>
                  <div className="mt-4 font-semibold">Ready when you are</div>
                  <div className="text-sm text-text-muted">
                    We'll match you in a few seconds.
                  </div>
                  <Button className="mt-5" full size="xl" onClick={onMatch}>
                    Find a lobby
                  </Button>
                </>
              )}
            </div>

            <ul className="rounded-2xl border border-border-soft bg-surface/40 p-4 text-sm text-text-soft space-y-2">
              <li className="flex gap-2"><span>🛡️</span> Age-safe matchmaking</li>
              <li className="flex gap-2"><span>🤖</span> Mute / block / report any time</li>
              <li className="flex gap-2"><span>🌈</span> Lobbies are mostly chill</li>
            </ul>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-2xl border text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition",
        active
          ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
          : "border-border-soft bg-surface/50 text-text-soft",
      )}
    >
      {icon} {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "h-7 w-12 rounded-full border transition relative",
        checked ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-white/10 border-white/15",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 bg-white rounded-full shadow transition",
          checked ? "left-[calc(100%-22px)]" : "left-0.5",
        )}
      />
    </button>
  );
}
