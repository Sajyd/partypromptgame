export type SkillLevel = "casual" | "regular" | "competitive";
export type PlayStyle = "creative" | "chaotic" | "strategic" | "social";

export type Genre =
  | "Platformer"
  | "Racing"
  | "Horror"
  | "Puzzle"
  | "Survival"
  | "Shooter-lite"
  | "Physics chaos"
  | "Adventure"
  | "Party"
  | "Experimental";

export type GameKind =
  | "platformer"
  | "collect"
  | "dodger"
  | "maze"
  | "arena";

export interface User {
  id: string;
  displayName: string;
  age: number;
  avatar: string; // emoji
  color: string; // hex
  playStyle: PlayStyle;
  skill: SkillLevel;
  genres: Genre[];
  bio?: string;
  joinedAt: number;
  friendCode: string;
  stats: {
    gamesCreated: number;
    gamesPlayed: number;
    contributions: number;
    likes: number;
  };
}

export type LobbyMode = "challenge" | "sandbox" | null;

export interface LobbyPlayer {
  id: string;
  displayName: string;
  avatar: string;
  color: string;
  isHost?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  isSpeaking?: boolean;
  status: "joining" | "ready" | "creating";
}

export type TaskKind =
  | "mechanics"
  | "world"
  | "rules"
  | "enemies"
  | "items"
  | "visuals"
  | "audio";

export interface AssignedTask {
  id: string;
  kind: TaskKind;
  title: string;
  description: string;
  hint: string;
  assignee: string; // player id
  prompt?: string;
  submittedAt?: number;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  mode: LobbyMode;
  theme: string;
  idea: string;
  players: LobbyPlayer[];
  createdAt: number;
  isPublic: boolean;
  voiceEnabled: boolean;
  tasks: AssignedTask[];
  timer?: number; // seconds remaining if running
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  authorAvatar: string;
  text: string;
  ts: number;
  system?: boolean;
}

export interface PromptContribution {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  taskKind: TaskKind | "edit";
  text: string;
  ts: number;
  versionId?: string;
}

export interface GameVersion {
  id: string;
  parentId?: string;
  createdAt: number;
  authorId: string;
  authorName: string;
  summary: string; // short label
  changes: string[];
}

export interface GeneratedGame {
  id: string;
  title: string;
  thumbnail: string; // emoji or short svg key
  category: Genre;
  kind: GameKind;
  description: string;
  tags: string[];
  creators: { id: string; name: string; avatar: string; color: string }[];
  rating: number; // 0..5
  ratingCount: number;
  plays: number;
  players: number; // typical
  contributions: { author: string; authorColor: string; part: string; text: string }[];
  funnySummary: string;
  createdAt: number;
  remixOf?: string;
  hue: number; // for thumbnail tint
}
