"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AssignedTask,
  ChatMessage,
  GameVersion,
  GeneratedGame,
  Genre,
  Lobby,
  LobbyMode,
  LobbyPlayer,
  PromptContribution,
  TaskKind,
  User,
} from "./types";
import { uid, randomCode } from "./utils";
import { MOCK_GAMES, MOCK_PLAYERS } from "./mock-data";
import { assignTasks } from "./ai-mock";
import { APP_NAME, PERSIST_STORAGE_KEY } from "./brand";

interface AppState {
  user: User | null;
  lobby: Lobby | null;
  chat: ChatMessage[];
  contributions: PromptContribution[];
  versions: GameVersion[];
  currentVersionId: string | null;
  generatedGame: GeneratedGame | null;
  games: GeneratedGame[];
  favorites: string[];

  setUser: (user: User) => void;
  patchUser: (patch: Partial<User>) => void;
  signOut: () => void;

  createLobby: (opts?: { isPublic?: boolean }) => Lobby;
  joinLobbyByCode: (code: string) => Lobby | null;
  leaveLobby: () => void;
  patchLobby: (patch: Partial<Lobby>) => void;
  toggleVoice: () => void;
  togglePlayerMute: (playerId: string) => void;
  setMode: (mode: LobbyMode) => void;
  setIdea: (idea: string) => void;
  setTheme: (theme: string) => void;
  assignAITasks: () => void;
  submitTaskPrompt: (taskId: string, prompt: string) => void;
  reassignTask: (taskId: string, newAssigneeId: string) => void;
  startTimer: (seconds: number) => void;
  decrementTimer: () => void;

  sendChat: (text: string) => void;
  addSystemChat: (text: string) => void;

  addContribution: (text: string, kind: TaskKind | "edit") => void;
  rollbackToVersion: (versionId: string) => void;

  setGeneratedGame: (game: GeneratedGame | null) => void;
  publishGame: (game: GeneratedGame) => void;
  toggleFavorite: (gameId: string) => void;
}

const SELF_PLAYER_ID = "p_self";

function selfFromUser(user: User | null): LobbyPlayer | null {
  if (!user) return null;
  return {
    id: SELF_PLAYER_ID,
    displayName: user.displayName,
    avatar: user.avatar,
    color: user.color,
    isHost: true,
    status: "ready",
  };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      lobby: null,
      chat: [],
      contributions: [],
      versions: [],
      currentVersionId: null,
      generatedGame: null,
      games: MOCK_GAMES,
      favorites: [],

      setUser: (user) => set({ user }),
      patchUser: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : {})),
      signOut: () => {
        void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        set({
          user: null,
          lobby: null,
          chat: [],
          contributions: [],
          versions: [],
          currentVersionId: null,
          generatedGame: null,
        });
      },

      createLobby: (opts) => {
        const user = get().user;
        const self = selfFromUser(user);
        if (!self) throw new Error("Sign in first");
        const code = randomCode(6);
        const lobby: Lobby = {
          id: uid("lobby"),
          code,
          hostId: self.id,
          mode: null,
          theme: "",
          idea: "",
          players: [self],
          createdAt: Date.now(),
          isPublic: !!opts?.isPublic,
          voiceEnabled: false,
          tasks: [],
        };
        set({
          lobby,
          chat: [
            {
              id: uid("msg"),
              authorId: "system",
              authorName: APP_NAME,
              authorColor: "#9b5cff",
              authorAvatar: "✨",
              text: `Lobby ${code} is open. Invite friends or start with bots.`,
              ts: Date.now(),
              system: true,
            },
          ],
          contributions: [],
          versions: [],
          currentVersionId: null,
          generatedGame: null,
        });
        return lobby;
      },

      joinLobbyByCode: (code) => {
        const user = get().user;
        const self = selfFromUser(user);
        if (!self) return null;
        // For prototype: synthesize a fake lobby with bots already present
        const bots: LobbyPlayer[] = MOCK_PLAYERS.slice(0, 3).map((p, i) => ({
          id: p.id,
          displayName: p.displayName,
          avatar: p.avatar,
          color: p.color,
          isHost: i === 0,
          status: "ready",
        }));
        self.isHost = false;
        const lobby: Lobby = {
          id: uid("lobby"),
          code: code.toUpperCase(),
          hostId: bots[0].id,
          mode: null,
          theme: "",
          idea: "",
          players: [...bots, self],
          createdAt: Date.now(),
          isPublic: false,
          voiceEnabled: false,
          tasks: [],
        };
        set({
          lobby,
          chat: [
            {
              id: uid("msg"),
              authorId: "system",
              authorName: APP_NAME,
              authorColor: "#9b5cff",
              authorAvatar: "✨",
              text: `You joined ${lobby.code}. Say hi!`,
              ts: Date.now(),
              system: true,
            },
            {
              id: uid("msg"),
              authorId: bots[0].id,
              authorName: bots[0].displayName,
              authorColor: bots[0].color,
              authorAvatar: bots[0].avatar,
              text: "yo welcome 👋",
              ts: Date.now(),
            },
          ],
          contributions: [],
          versions: [],
          currentVersionId: null,
          generatedGame: null,
        });
        return lobby;
      },

      leaveLobby: () =>
        set({
          lobby: null,
          chat: [],
          contributions: [],
          versions: [],
          currentVersionId: null,
          generatedGame: null,
        }),

      patchLobby: (patch) =>
        set((s) => (s.lobby ? { lobby: { ...s.lobby, ...patch } } : {})),

      toggleVoice: () =>
        set((s) =>
          s.lobby
            ? { lobby: { ...s.lobby, voiceEnabled: !s.lobby.voiceEnabled } }
            : {},
        ),

      togglePlayerMute: (playerId) =>
        set((s) => {
          if (!s.lobby) return {};
          return {
            lobby: {
              ...s.lobby,
              players: s.lobby.players.map((p) =>
                p.id === playerId ? { ...p, isMuted: !p.isMuted } : p,
              ),
            },
          };
        }),

      setMode: (mode) =>
        set((s) => (s.lobby ? { lobby: { ...s.lobby, mode } } : {})),

      setIdea: (idea) =>
        set((s) => (s.lobby ? { lobby: { ...s.lobby, idea } } : {})),

      setTheme: (theme) =>
        set((s) => (s.lobby ? { lobby: { ...s.lobby, theme } } : {})),

      assignAITasks: () => {
        const { lobby } = get();
        if (!lobby) return;
        const tasks = assignTasks(lobby.idea || lobby.theme, lobby.players);
        set({
          lobby: { ...lobby, tasks },
          chat: [
            ...get().chat,
            {
              id: uid("msg"),
              authorId: "system",
              authorName: `${APP_NAME} AI`,
              authorColor: "#4df7ff",
              authorAvatar: "🤖",
              text: `Tasks dealt. ${tasks.length} parts to prompt — go go go!`,
              ts: Date.now(),
              system: true,
            },
          ],
        });
      },

      submitTaskPrompt: (taskId, prompt) => {
        const { lobby, contributions, user } = get();
        if (!lobby) return;
        const updatedTasks: AssignedTask[] = lobby.tasks.map((t) =>
          t.id === taskId
            ? { ...t, prompt, submittedAt: Date.now() }
            : t,
        );
        const task = updatedTasks.find((t) => t.id === taskId);
        const self = lobby.players.find((p) => p.id === SELF_PLAYER_ID);
        if (!task || !self) return;
        const isMe = task.assignee === self.id;
        const author = lobby.players.find((p) => p.id === task.assignee);
        if (!author) return;
        set({
          lobby: { ...lobby, tasks: updatedTasks },
          contributions: [
            ...contributions,
            {
              id: uid("c"),
              authorId: author.id,
              authorName: isMe && user ? user.displayName : author.displayName,
              authorColor: author.color,
              taskKind: task.kind,
              text: prompt,
              ts: Date.now(),
            },
          ],
        });
      },

      reassignTask: (taskId, newAssigneeId) =>
        set((s) => {
          if (!s.lobby) return {};
          return {
            lobby: {
              ...s.lobby,
              tasks: s.lobby.tasks.map((t) =>
                t.id === taskId ? { ...t, assignee: newAssigneeId } : t,
              ),
            },
          };
        }),

      startTimer: (seconds) =>
        set((s) => (s.lobby ? { lobby: { ...s.lobby, timer: seconds } } : {})),

      decrementTimer: () =>
        set((s) => {
          if (!s.lobby || s.lobby.timer == null) return {};
          const t = Math.max(0, s.lobby.timer - 1);
          return { lobby: { ...s.lobby, timer: t } };
        }),

      sendChat: (text) => {
        const { user, lobby, chat } = get();
        if (!user || !lobby || !text.trim()) return;
        set({
          chat: [
            ...chat,
            {
              id: uid("msg"),
              authorId: SELF_PLAYER_ID,
              authorName: user.displayName,
              authorColor: user.color,
              authorAvatar: user.avatar,
              text: text.trim(),
              ts: Date.now(),
            },
          ],
        });
      },

      addSystemChat: (text) =>
        set((s) => ({
          chat: [
            ...s.chat,
            {
              id: uid("msg"),
              authorId: "system",
              authorName: APP_NAME,
              authorColor: "#9b5cff",
              authorAvatar: "✨",
              text,
              ts: Date.now(),
              system: true,
            },
          ],
        })),

      addContribution: (text, kind) => {
        const { user, lobby, contributions, versions } = get();
        if (!user || !lobby) return;
        const versionId = uid("v");
        const newVersion: GameVersion = {
          id: versionId,
          parentId: get().currentVersionId ?? undefined,
          createdAt: Date.now(),
          authorId: SELF_PLAYER_ID,
          authorName: user.displayName,
          summary: text.length > 36 ? text.slice(0, 36) + "…" : text,
          changes: [text],
        };
        set({
          versions: [...versions, newVersion],
          currentVersionId: versionId,
          contributions: [
            ...contributions,
            {
              id: uid("c"),
              authorId: SELF_PLAYER_ID,
              authorName: user.displayName,
              authorColor: user.color,
              taskKind: kind,
              text,
              ts: Date.now(),
              versionId,
            },
          ],
        });
      },

      rollbackToVersion: (versionId) =>
        set({ currentVersionId: versionId }),

      setGeneratedGame: (game) => set({ generatedGame: game }),

      publishGame: (game) =>
        set((s) => ({
          games: [game, ...s.games.filter((g) => g.id !== game.id)],
        })),

      toggleFavorite: (gameId) =>
        set((s) => ({
          favorites: s.favorites.includes(gameId)
            ? s.favorites.filter((g) => g !== gameId)
            : [...s.favorites, gameId],
        })),
    }),
    {
      name: PERSIST_STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined as unknown as Storage)),
      partialize: (state) => ({
        user: state.user,
        favorites: state.favorites,
        games: state.games,
      }),
    },
  ),
);

export const SELF_ID = SELF_PLAYER_ID;

export function genresList(): Genre[] {
  return [
    "Platformer",
    "Racing",
    "Horror",
    "Puzzle",
    "Survival",
    "Shooter-lite",
    "Physics chaos",
    "Adventure",
    "Party",
    "Experimental",
  ];
}
