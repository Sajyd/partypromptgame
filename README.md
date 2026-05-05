# Promptjam

A mobile-first multiplayer party platform where players prompt different parts
of a tiny HTML5 / Three.js game and play it together. This repo is a
clickable prototype with mocked AI generation, mocked multiplayer, and five
playable Three.js mini-game templates.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Three.js](https://threejs.org) for the in-browser games
- [Zustand](https://github.com/pmndrs/zustand) for client state (with
  `localStorage` persistence)
- [Framer Motion](https://www.framer.com/motion/) for transitions
- [Lucide](https://lucide.dev) icons

## Getting started

```bash
# Requires Node 20+
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The flow:

1. Landing page → Get started
2. Onboarding (name, age, avatar, play style, skill, genres)
3. Home dashboard
4. Create or join a lobby (or match)
5. In the lobby, add bots, then pick **Timed Challenge** or **Sandbox**
6. **Timed Challenge**: pick a theme + write the big idea → AI assigns each
   player a part → submit prompts → "Generate game"
7. **Sandbox**: chat-style prompts hit a live Three.js preview, with version
   history + rollback
8. The generation screen plays an animated AI thinking sequence, then loads
   the playable game with credit toasts highlighting who made what
9. End results screen with funny AI summary, star rating, save/publish/share

## Routes

- `/` — Landing
- `/onboarding`
- `/home` — dashboard
- `/lobby` — create / join / match hub
- `/lobby/[code]` — waiting room
- `/lobby/[code]/challenge` — Timed Prompt Challenge
- `/lobby/[code]/sandbox` — Free Sandbox
- `/lobby/[code]/generating` — AI build screen
- `/lobby/[code]/play` — playable game with contributor highlights
- `/lobby/[code]/results` — end credits + rate / publish
- `/browse` — community games
- `/game/[id]` — game details
- `/profile`

## Architecture

```
app/                Next.js App Router pages
components/
  ui/               Buttons, inputs, cards, headers, bottom nav, avatars
  game/             GameCanvas (5 Three.js templates), GameThumb, GameCard
  AuthGate.tsx      Redirects unauthenticated users to onboarding
lib/
  types.ts          User, Lobby, GameSession, Contribution, Game models
  store.ts          Zustand store (persisted) — single source of truth
  mock-data.ts      Sample games, themes, players, avatars, colors, genres
  ai-mock.ts        Mocked AI: task assignment, title gen, kind picker, summaries
  utils.ts          cn(), uid(), code generator, time helpers
```

### State model (Zustand)

- `user` — onboarded profile (persisted)
- `lobby` — current room, players, tasks, voice/chat state
- `chat` — current lobby messages
- `contributions` — sandbox prompt history (with authorship)
- `versions` + `currentVersionId` — sandbox version history / rollback
- `generatedGame` — last produced playable game
- `games` — published games (mocks + user-published, persisted)
- `favorites` — favorited game ids (persisted)

### Mock AI

`lib/ai-mock.ts` deterministically derives:
- Task list per player count (mechanics, world, rules, enemies, items, visuals,
  audio)
- A `GameKind` (one of `platformer | collect | dodger | maze | arena`) from
  keywords in the idea
- A title, tags, hue, funny verdict line
- A timed sequence of "AI thinking" steps shown on the generation screen

Swap the bodies of these functions for real AI calls without touching the UI.

### Five Three.js templates

`components/game/GameCanvas.tsx` ships five tiny self-contained games — picked
based on the prompt content — all sharing one mobile-friendly HUD with touch
buttons:

- `platformer` — side-scroller with platforms, stars, and a goal
- `collect` — top-down floor where you grab cubes
- `dodger` — endless lane runner that gets faster
- `maze` — top-down maze with auto-generated walls and a torus goal
- `arena` — twin-stick survival arena with auto-aim shooting

## Things deliberately faked for the prototype

- "Real-time" multiplayer (bots are added locally and "simulate friends" fills
  in prompts).
- Voice chat (UI for join/mute/deafen, no WebRTC).
- AI generation (mock pipeline replaces every prompt-to-game step).

## Mobile-first notes

- Hard cap of `max-w-[480px]` on every page
- Touch targets are at least 40 px tall
- Bottom tab bar uses `env(safe-area-inset-bottom)`
- Touch on-screen controls in `GameCanvas`
- Animations are short and respect tap interactions

## Replacing the mocks

- Replace `assignTasks`, `generateTitle`, `pickGameKind`, `generateFunnySummary`
  with calls to your AI provider.
- Swap `joinLobbyByCode` and lobby mutations with WebSocket-backed updates.
- Swap voice toggles with WebRTC + a SFU.
- Swap `MOCK_GAMES` with a server-side game registry.

The UI does not assume anything about the data source — every store mutation
happens through dedicated action functions, so adding a server is mechanical.
