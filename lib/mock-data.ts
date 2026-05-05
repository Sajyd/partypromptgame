import type { GeneratedGame, Genre, GameKind } from "./types";

export const AVATARS = [
  "🦊", "🐻", "🐸", "🐙", "🦕", "🐳", "🦄", "🦖", "🐲", "🐧",
  "🐼", "🦦", "🐨", "🦁", "🐯", "🐮", "🐷", "🐔", "🐤", "🦅",
  "🦉", "🦇", "🦋", "🐝", "🐞", "🐢", "🦀", "🦞", "🐠", "🐡",
];

export const COLORS = [
  "#ff4da8", "#9b5cff", "#4df7ff", "#c4ff4d", "#ffd14d",
  "#ff7a5c", "#5cffb8", "#5c8aff", "#ff5cf0", "#ffea5c",
];

export const GENRES: Genre[] = [
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

export const GENRE_EMOJI: Record<Genre, string> = {
  "Platformer": "🦘",
  "Racing": "🏎️",
  "Horror": "👻",
  "Puzzle": "🧩",
  "Survival": "🏕️",
  "Shooter-lite": "🎯",
  "Physics chaos": "💥",
  "Adventure": "🗺️",
  "Party": "🎉",
  "Experimental": "🧪",
};

export const GENRE_GRADIENTS: Record<Genre, string> = {
  "Platformer": "linear-gradient(135deg,#9b5cff 0%,#4df7ff 100%)",
  "Racing": "linear-gradient(135deg,#ff4da8 0%,#ffd14d 100%)",
  "Horror": "linear-gradient(135deg,#1a0033 0%,#9b5cff 100%)",
  "Puzzle": "linear-gradient(135deg,#4df7ff 0%,#c4ff4d 100%)",
  "Survival": "linear-gradient(135deg,#5cffb8 0%,#ffd14d 100%)",
  "Shooter-lite": "linear-gradient(135deg,#ff5c5c 0%,#ff4da8 100%)",
  "Physics chaos": "linear-gradient(135deg,#ffd14d 0%,#ff4da8 100%)",
  "Adventure": "linear-gradient(135deg,#ff7a5c 0%,#9b5cff 100%)",
  "Party": "linear-gradient(135deg,#ff4da8 0%,#9b5cff 100%)",
  "Experimental": "linear-gradient(135deg,#c4ff4d 0%,#4df7ff 100%)",
};

const MOCK_CREATORS = [
  { id: "u_alex", name: "Alex", avatar: "🦊", color: "#ff4da8" },
  { id: "u_sam", name: "Sam", avatar: "🐸", color: "#4df7ff" },
  { id: "u_lina", name: "Lina", avatar: "🦄", color: "#9b5cff" },
  { id: "u_kai", name: "Kai", avatar: "🐙", color: "#c4ff4d" },
  { id: "u_zoe", name: "Zoe", avatar: "🦋", color: "#ffd14d" },
  { id: "u_ravi", name: "Ravi", avatar: "🐲", color: "#ff7a5c" },
  { id: "u_min", name: "Min", avatar: "🐻", color: "#5cffb8" },
  { id: "u_kat", name: "Kat", avatar: "🐯", color: "#ff5cf0" },
];

function randomCreators(n: number) {
  const shuffled = [...MOCK_CREATORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const KIND_BY_GENRE: Partial<Record<Genre, GameKind>> = {
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

const SAMPLE_GAMES: Array<Pick<GeneratedGame,
  "title" | "category" | "thumbnail" | "description" | "tags" | "rating" | "ratingCount" | "plays" | "players" | "funnySummary" | "hue"> & { contribParts?: Array<[string, string, string]> }> = [
  {
    title: "Frog Frog Lava Quest",
    category: "Platformer",
    thumbnail: "🐸",
    description: "Hop across vanishing lily pads while a grumpy moon yells at you.",
    tags: ["frog", "lava", "double jump", "chaotic"],
    rating: 4.6,
    ratingCount: 312,
    plays: 4820,
    players: 4,
    funnySummary: "It's a platformer where the only way to win is to apologize to the moon.",
    hue: 280,
    contribParts: [
      ["Jump mechanic", "double-jump but only on tuesdays", "u_alex"],
      ["Map layout", "endless lily pads over a lava ocean", "u_sam"],
      ["Enemies", "yelling moons and rude clouds", "u_lina"],
      ["Win condition", "say sorry to the moon 3 times", "u_kai"],
    ],
  },
  {
    title: "Ramen Racer 3000",
    category: "Racing",
    thumbnail: "🍜",
    description: "Race tiny noodle bowls down a kitchen counter that won't sit still.",
    tags: ["ramen", "speed", "kitchen", "physics"],
    rating: 4.4,
    ratingCount: 188,
    plays: 2940,
    players: 3,
    funnySummary: "Ramen physics. Ramen vibes. Mostly ramen.",
    hue: 30,
    contribParts: [
      ["Mechanics", "drift on broth, slide on sauce", "u_zoe"],
      ["Map", "a giant breakfast bar at sunset", "u_ravi"],
      ["Visuals", "watercolor noodles, jiggly camera", "u_min"],
    ],
  },
  {
    title: "Haunted Vending Machine",
    category: "Horror",
    thumbnail: "🥤",
    description: "A cursed snack hallway that whispers your snack history.",
    tags: ["spooky", "vending", "low-poly", "ambient"],
    rating: 4.8,
    ratingCount: 421,
    plays: 6200,
    players: 2,
    funnySummary: "It knows what you bought in 2014 and it is judging you.",
    hue: 260,
    contribParts: [
      ["Player mechanics", "flashlight that runs on regrets", "u_kat"],
      ["Audio", "fluorescent buzz and quiet sobbing", "u_alex"],
      ["Enemies", "snack ghosts who take coins", "u_lina"],
    ],
  },
  {
    title: "Cube of Wisdom",
    category: "Puzzle",
    thumbnail: "🧊",
    description: "Solve riddles by rolling a sentient cube that complains a lot.",
    tags: ["puzzle", "voice acting", "minimal", "cozy"],
    rating: 4.2,
    ratingCount: 144,
    plays: 1880,
    players: 1,
    funnySummary: "The cube has opinions. The cube has a podcast.",
    hue: 180,
    contribParts: [
      ["Rules", "every wrong answer the cube sighs louder", "u_sam"],
      ["Map", "a clean white room with a single chair", "u_kai"],
      ["Visuals", "soft pastels and dramatic shadows", "u_zoe"],
    ],
  },
  {
    title: "Soup Survival Saturday",
    category: "Survival",
    thumbnail: "🍲",
    description: "Survive a Saturday potluck where every soup is alive.",
    tags: ["soup", "weekend", "co-op", "wholesome"],
    rating: 4.5,
    ratingCount: 230,
    plays: 3150,
    players: 5,
    funnySummary: "Bring oyster crackers. Trust no broth.",
    hue: 50,
    contribParts: [
      ["Mechanics", "ladle melee, spoon dodge", "u_ravi"],
      ["Items", "saltines that shield, croutons that explode", "u_min"],
      ["Win condition", "survive until grandma arrives", "u_kat"],
    ],
  },
  {
    title: "Pigeon vs Wifi",
    category: "Shooter-lite",
    thumbnail: "🐦",
    description: "Defend the park bench from rogue routers with crumb beams.",
    tags: ["pigeon", "wifi", "wave", "silly"],
    rating: 4.3,
    ratingCount: 175,
    plays: 2660,
    players: 3,
    funnySummary: "The pigeon is the chosen one. The wifi is mid.",
    hue: 200,
    contribParts: [
      ["Mechanics", "tap to shoot crumbs, hold to coo", "u_alex"],
      ["Enemies", "routers, modems, the internet itself", "u_kai"],
      ["Audio", "lo-fi pigeon beats", "u_lina"],
    ],
  },
  {
    title: "Trampoline Apocalypse",
    category: "Physics chaos",
    thumbnail: "🤸",
    description: "Bounce through a city where everything is a trampoline.",
    tags: ["bounce", "ragdoll", "city", "wow"],
    rating: 4.7,
    ratingCount: 388,
    plays: 5450,
    players: 4,
    funnySummary: "There is no ground. There is only bounce.",
    hue: 320,
    contribParts: [
      ["Mechanics", "every collision adds bounciness", "u_zoe"],
      ["Map", "downtown made of inflatable buildings", "u_min"],
      ["Visuals", "rainbow trails and confetti", "u_ravi"],
    ],
  },
  {
    title: "Lost in the Inbox",
    category: "Adventure",
    thumbnail: "📬",
    description: "Quest through a maze of unread emails to reach Inbox Zero.",
    tags: ["email", "quest", "anxiety", "puzzle"],
    rating: 4.1,
    ratingCount: 96,
    plays: 1410,
    players: 2,
    funnySummary: "The final boss is a meeting that could have been an email.",
    hue: 140,
    contribParts: [
      ["Map", "winding folders with sticky drafts", "u_sam"],
      ["Items", "snooze potions and reply scrolls", "u_kat"],
      ["Mechanics", "skim or read in detail (you'll regret both)", "u_alex"],
    ],
  },
  {
    title: "Confetti Cannon Royale",
    category: "Party",
    thumbnail: "🎊",
    description: "Wholesome battle royale, but the only weapon is confetti.",
    tags: ["party", "battle", "confetti", "co-op"],
    rating: 4.9,
    ratingCount: 612,
    plays: 9120,
    players: 8,
    funnySummary: "The winner is whoever made everyone smile the most.",
    hue: 340,
    contribParts: [
      ["Mechanics", "press to spray, hold to mega-spray", "u_kai"],
      ["Map", "a ballroom floor that loves you", "u_lina"],
      ["Audio", "trumpet fanfare on every elimination", "u_zoe"],
    ],
  },
  {
    title: "Cloud Gardening Sim",
    category: "Experimental",
    thumbnail: "☁️",
    description: "Plant pretend gardens on a cloud that has commitment issues.",
    tags: ["cozy", "weather", "vibes", "weird"],
    rating: 4.5,
    ratingCount: 240,
    plays: 3320,
    players: 1,
    funnySummary: "Every flower is a little sky friend. They are very busy.",
    hue: 220,
    contribParts: [
      ["World", "five floating cloud gardens", "u_ravi"],
      ["Items", "rain seeds, sunshine spades", "u_min"],
      ["Visuals", "watercolor with too many sparkles", "u_kat"],
    ],
  },
  {
    title: "Basement Boss Rush",
    category: "Shooter-lite",
    thumbnail: "🕹️",
    description: "Five rooms, five very bad bosses, one tiny laser.",
    tags: ["boss", "retro", "tight", "snappy"],
    rating: 4.2,
    ratingCount: 130,
    plays: 1820,
    players: 1,
    funnySummary: "All bosses are roommates. They have unresolved tension.",
    hue: 0,
    contribParts: [
      ["Mechanics", "dash + tiny laser", "u_alex"],
      ["Enemies", "the laundry, the dishes, the rent", "u_sam"],
      ["Win condition", "do all chores in 90 seconds", "u_kai"],
    ],
  },
  {
    title: "Skate Like It's Friday",
    category: "Platformer",
    thumbnail: "🛹",
    description: "Grind on rails that respond to vibes.",
    tags: ["skate", "rails", "music", "smooth"],
    rating: 4.6,
    ratingCount: 285,
    plays: 4150,
    players: 2,
    funnySummary: "The board judges you in a kind, supportive way.",
    hue: 80,
    contribParts: [
      ["Mechanics", "ollie + grind + style meter", "u_zoe"],
      ["Map", "rooftop park at golden hour", "u_kat"],
      ["Audio", "lo-fi with skate sounds", "u_min"],
    ],
  },
];

export const MOCK_GAMES: GeneratedGame[] = SAMPLE_GAMES.map((g, i) => {
  const creators = randomCreators(2 + Math.floor(Math.random() * 3));
  const parts = (g.contribParts ?? []).map(([part, text, authorId]) => {
    const author = MOCK_CREATORS.find((c) => c.id === authorId) ?? creators[0];
    return {
      author: author.name,
      authorColor: author.color,
      part,
      text,
    };
  });
  return {
    id: `game_${i}_${g.title.toLowerCase().replace(/\W+/g, "-")}`,
    title: g.title,
    thumbnail: g.thumbnail,
    category: g.category,
    kind: KIND_BY_GENRE[g.category] ?? "collect",
    description: g.description,
    tags: g.tags,
    creators,
    rating: g.rating,
    ratingCount: g.ratingCount,
    plays: g.plays,
    players: g.players,
    contributions: parts,
    funnySummary: g.funnySummary,
    createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
    hue: g.hue,
  };
});

export const MOCK_PLAYERS = [
  { id: "p_kira", displayName: "Kira", avatar: "🦊", color: "#ff4da8" },
  { id: "p_milo", displayName: "Milo", avatar: "🐸", color: "#4df7ff" },
  { id: "p_juno", displayName: "Juno", avatar: "🦄", color: "#9b5cff" },
  { id: "p_otis", displayName: "Otis", avatar: "🐙", color: "#c4ff4d" },
  { id: "p_yumi", displayName: "Yumi", avatar: "🦋", color: "#ffd14d" },
  { id: "p_dax", displayName: "Dax", avatar: "🐲", color: "#ff7a5c" },
];

export const SAMPLE_THEMES = [
  "🍕 Snacks gone rogue",
  "🌌 Cosmic chaos",
  "🦖 Tiny dinosaurs",
  "🏰 Soft fantasy",
  "🚀 Backyard space race",
  "🐙 Underwater drama",
  "🎪 Circus, but cozy",
  "🌧️ Sad robots",
  "🦴 Skeleton beach day",
  "🍿 Movie night chaos",
];

export const TASK_HINTS: Record<string, string> = {
  mechanics: "How does the player move and act? Jump? Drift? Throw confetti?",
  world: "Where does it happen? Sky island, basement, kitchen counter, dream?",
  rules: "How do you win or lose? What's the goal? Make it weird and clear.",
  enemies: "Who or what is in the way? Make them silly, scary, or both.",
  items: "What can the player pick up or use? Powerups, snacks, vibes?",
  visuals: "Mood and look. Pastel? Retro? Glitchy? Watercolor?",
  audio: "Music + sound feel. Lo-fi? Boss-fight metal? Ocean ambience?",
};

export const TASK_TITLES: Record<string, string> = {
  mechanics: "Player Mechanics",
  world: "Map / World",
  rules: "Rules / Win condition",
  enemies: "Enemies / Obstacles",
  items: "Items / Powerups",
  visuals: "Visual Style",
  audio: "Audio / Mood",
};

export const TASK_EMOJI: Record<string, string> = {
  mechanics: "🕹️",
  world: "🗺️",
  rules: "🏁",
  enemies: "👾",
  items: "🍒",
  visuals: "🎨",
  audio: "🔊",
};

export const FUNNY_SUMMARIES = [
  "It's a game. It's also a vibe. Don't think too hard.",
  "Made by 4 friends in 6 minutes. Tested by exactly nobody.",
  "Looks weird. Plays weirder. We love it.",
  "Built with love and one extremely confused goose.",
  "98% chaos, 2% genius. Possibly a masterpiece.",
];
