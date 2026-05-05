import type { AssignedTask, GameKind, Genre, LobbyPlayer, TaskKind } from "./types";
import { TASK_HINTS, TASK_TITLES } from "./mock-data";
import { uid } from "./utils";

const TASKS_FOR_SIZE: Record<number, TaskKind[]> = {
  1: ["mechanics"],
  2: ["mechanics", "world"],
  3: ["mechanics", "world", "rules"],
  4: ["mechanics", "world", "rules", "enemies"],
  5: ["mechanics", "world", "rules", "enemies", "visuals"],
  6: ["mechanics", "world", "rules", "enemies", "items", "visuals"],
  7: ["mechanics", "world", "rules", "enemies", "items", "visuals", "audio"],
  8: ["mechanics", "world", "rules", "enemies", "items", "visuals", "audio", "items"],
};

export function assignTasks(idea: string, players: LobbyPlayer[]): AssignedTask[] {
  const list = TASKS_FOR_SIZE[Math.min(8, Math.max(1, players.length))] ?? TASKS_FOR_SIZE[3];
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  return list.map((kind, i) => {
    const player = shuffled[i % shuffled.length];
    return {
      id: uid("task"),
      kind,
      title: TASK_TITLES[kind],
      description: tailorDescription(kind, idea),
      hint: TASK_HINTS[kind],
      assignee: player.id,
    };
  });
}

function tailorDescription(kind: TaskKind, idea: string): string {
  const trimmed = idea.trim() || "a tiny chaotic game";
  switch (kind) {
    case "mechanics":
      return `Decide how the player controls things in “${trimmed}”. Keep it simple — one verb is enough.`;
    case "world":
      return `Describe the world or map for “${trimmed}”. Where are we? What does it feel like?`;
    case "rules":
      return `Define how to win or lose “${trimmed}”. Goofy is good. Clear is better.`;
    case "enemies":
      return `Invent the enemies or obstacles in “${trimmed}”. Funny names encouraged.`;
    case "items":
      return `Add items or powerups for “${trimmed}”. Snacks, scrolls, vibes — anything.`;
    case "visuals":
      return `Pick a visual style for “${trimmed}”. Mood, palette, weather — paint with words.`;
    case "audio":
      return `Set the audio mood for “${trimmed}”. Genre, instruments, sound effects.`;
  }
}

export function pickGameKind(genre: Genre, idea: string): GameKind {
  const text = idea.toLowerCase();
  if (text.match(/jump|platform|hop|leap|climb/)) return "platformer";
  if (text.match(/dodge|avoid|race|run|chase|bullet/)) return "dodger";
  if (text.match(/maze|puzzle|labyrinth|hidden|escape/)) return "maze";
  if (text.match(/survive|wave|horde|defend|arena|fight/)) return "arena";
  if (text.match(/collect|gather|find|catch|fetch/)) return "collect";

  const map: Record<Genre, GameKind> = {
    "Platformer": "platformer",
    "Racing": "dodger",
    "Survival": "arena",
    "Puzzle": "maze",
    "Horror": "maze",
    "Shooter-lite": "arena",
    "Physics chaos": "dodger",
    "Adventure": "collect",
    "Party": "collect",
    "Experimental": "platformer",
  };
  return map[genre] ?? "collect";
}

const TITLE_PARTS_A = [
  "Tiny", "Big", "Cosmic", "Greedy", "Soft", "Spicy", "Lonely", "Happy",
  "Cursed", "Sleepy", "Loud", "Crunchy", "Fluffy", "Dramatic", "Mild",
];
const TITLE_PARTS_B = [
  "Frog", "Pizza", "Robot", "Ghost", "Kitten", "Skater", "Detective",
  "Wizard", "Pigeon", "Toaster", "Cloud", "Dino", "Knight", "Bee", "Goose",
];
const TITLE_PARTS_C = [
  "Quest", "Rampage", "Nights", "Society", "Rodeo", "Royale", "Diaries",
  "Adventure", "Saga", "Brunch", "Marathon", "Vibes", "Showdown",
];

export function generateTitle(idea: string): string {
  const words = idea.trim().split(/\s+/).filter((w) => w.length > 3);
  if (words.length >= 2) {
    const a = words[Math.floor(Math.random() * words.length)];
    const b = pick(TITLE_PARTS_C);
    const c = pick(TITLE_PARTS_A);
    return cap(`${c} ${a} ${b}`);
  }
  return cap(`${pick(TITLE_PARTS_A)} ${pick(TITLE_PARTS_B)} ${pick(TITLE_PARTS_C)}`);
}

function cap(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
function pick<T>(a: readonly T[]) {
  return a[Math.floor(Math.random() * a.length)];
}

const FUNNY_TEMPLATES = [
  "It's a {genre} where you {verb} until things get weird.",
  "Made in 4 minutes. Tested in 0. Loved by 1 (the AI).",
  "Hand-crafted chaos with extra sparkles.",
  "The vibe is high. The polygons are low. We are at peace.",
  "If your friend laughs, the game wins.",
  "Bring snacks. Bring patience. Bring a friend.",
];

const VERBS = ["hop", "race", "yell", "collect", "panic", "dance", "snack", "fly", "swim"];

export function generateFunnySummary(genre: Genre): string {
  const t = pick(FUNNY_TEMPLATES);
  return t.replace("{genre}", genre.toLowerCase()).replace("{verb}", pick(VERBS));
}

export const GENERATION_STEPS = [
  "Reading your prompts ✨",
  "Negotiating with the physics engine 🧲",
  "Hiring tiny pixel actors 🎭",
  "Painting the world 🎨",
  "Tuning the chaos dial 🎛️",
  "Bouncing it off a confused robot 🤖",
  "Writing the credits 🏆",
];
