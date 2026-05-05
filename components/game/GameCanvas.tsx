"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MutableRefObject } from "react";
import * as THREE from "three";
import type { GameKind } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  kind: GameKind;
  hue?: number;
  onScore?: (score: number) => void;
  onWin?: () => void;
  onLose?: () => void;
  className?: string;
  paused?: boolean;
  controls?: "auto" | "touch" | "keyboard";
}

interface GameApi {
  destroy: () => void;
  resize: () => void;
  setPaused: (p: boolean) => void;
  setInput: (input: { left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean; action: boolean }) => void;
}

type GameInput = Parameters<GameApi["setInput"]>[0];

function isGameControlCode(code: string): boolean {
  return (
    code === "ArrowLeft" ||
    code === "ArrowRight" ||
    code === "ArrowUp" ||
    code === "ArrowDown" ||
    code === "Space" ||
    code === "KeyW" ||
    code === "KeyA" ||
    code === "KeyS" ||
    code === "KeyD" ||
    code === "ShiftLeft" ||
    code === "ShiftRight" ||
    code === "Enter"
  );
}

function applyKeyToInput(
  down: boolean,
  code: string,
  inputRef: MutableRefObject<GameInput>,
  api: GameApi | null,
) {
  const m = inputRef.current;
  if (code === "ArrowLeft" || code === "KeyA") m.left = down;
  if (code === "ArrowRight" || code === "KeyD") m.right = down;
  if (code === "ArrowUp" || code === "KeyW") m.up = down;
  if (code === "ArrowDown" || code === "KeyS") m.down = down;
  if (code === "Space") m.jump = down;
  if (code === "ShiftLeft" || code === "ShiftRight" || code === "Enter") m.action = down;
  api?.setInput(m);
}

export function GameCanvas({
  kind,
  hue = 280,
  onScore,
  onWin,
  onLose,
  className,
  paused,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<GameApi | null>(null);
  const inputRef = useRef<GameInput>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    action: false,
  });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [controlsFocused, setControlsFocused] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
      return;
    }
    if (!isGameControlCode(e.code)) return;
    e.preventDefault();
    e.stopPropagation();
    applyKeyToInput(true, e.code, inputRef, apiRef.current);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!isGameControlCode(e.code)) return;
    e.preventDefault();
    e.stopPropagation();
    applyKeyToInput(false, e.code, inputRef, apiRef.current);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.shadowMap.enabled = false;
    wrap.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    const setup = makeGame(kind, hue, renderer, {
      onScore: (s) => {
        setScore(s);
        onScore?.(s);
      },
      onWin: () => {
        setStatus("won");
        onWin?.();
      },
      onLose: () => {
        setStatus("lost");
        onLose?.();
      },
    });

    const api: GameApi = setup.api;
    apiRef.current = api;

    const onResize = () => {
      if (!wrapRef.current) return;
      renderer.setSize(wrapRef.current.clientWidth, wrapRef.current.clientHeight);
      api.resize();
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      api.setInput(inputRef.current);
    };
    const loop = setInterval(tick, 16);

    return () => {
      clearInterval(loop);
      window.removeEventListener("resize", onResize);
      api.destroy();
      renderer.dispose();
      if (renderer.domElement.parentNode === wrap) {
        wrap.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, hue]);

  useEffect(() => {
    apiRef.current?.setPaused(!!paused);
  }, [paused]);

  /** Prevent iOS rubber-band / page scroll while dragging inside the game */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (e.target && el.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  // Touch controls handlers
  const setBtn = (key: keyof GameInput, val: boolean) => {
    inputRef.current = { ...inputRef.current, [key]: val };
    apiRef.current?.setInput(inputRef.current);
  };

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label="Mini-game"
      className={cn(
        "relative w-full h-full overflow-hidden rounded-3xl touch-none outline-none overscroll-contain",
        "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        className,
      )}
      onFocus={() => setControlsFocused(true)}
      onBlur={() => setControlsFocused(false)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerDownCapture={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        rootRef.current?.focus({ preventScroll: true });
      }}
    >
      <div ref={wrapRef} className="absolute inset-0 z-0" />
      {!controlsFocused ? (
        <div
          className="absolute inset-0 z-[15] flex items-center justify-center bg-black/45 px-6 text-center backdrop-blur-[3px]"
          aria-hidden
        >
          <p className="pointer-events-none max-w-[16rem] rounded-2xl border border-white/15 bg-surface-2/95 px-4 py-3 text-sm font-semibold text-text shadow-lg">
            Tap or click to focus game controls
            <span className="mt-1 block text-xs font-normal text-text-muted">
              Escape returns focus to the page
            </span>
          </p>
        </div>
      ) : null}
      {/* HUD */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-full glass text-xs font-semibold">
          Score <span className="text-[var(--cyan)]">{score}</span>
        </div>
        {status === "won" && (
          <div className="px-3 py-1.5 rounded-full bg-[var(--lime)] text-black text-xs font-bold">
            ✨ WIN ✨
          </div>
        )}
        {status === "lost" && (
          <div className="px-3 py-1.5 rounded-full bg-[var(--danger)] text-white text-xs font-bold">
            OOF
          </div>
        )}
      </div>
      {/* Mobile touch controls — above focus overlay so taps work before keyboard focus */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[25] flex justify-between px-3">
        <div className="grid grid-cols-3 gap-2 pointer-events-auto">
          <div />
          <TouchBtn label="↑" onPress={(p) => setBtn("up", p)} />
          <div />
          <TouchBtn label="←" onPress={(p) => setBtn("left", p)} />
          <TouchBtn label="↓" onPress={(p) => setBtn("down", p)} />
          <TouchBtn label="→" onPress={(p) => setBtn("right", p)} />
        </div>
        <div className="flex items-end gap-2 pointer-events-auto">
          <TouchBtn label="A" onPress={(p) => setBtn("action", p)} big />
          <TouchBtn label="JUMP" onPress={(p) => setBtn("jump", p)} big primary />
        </div>
      </div>
    </div>
  );
}

function TouchBtn({
  label,
  onPress,
  big,
  primary,
}: {
  label: string;
  onPress: (pressed: boolean) => void;
  big?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        onPress(true);
      }}
      onPointerUp={() => onPress(false)}
      onPointerCancel={() => onPress(false)}
      onPointerLeave={() => onPress(false)}
      className={cn(
        "select-none flex items-center justify-center font-bold rounded-2xl border border-white/10 active:scale-95 transition-transform touch-none",
        big ? "h-14 w-14" : "h-11 w-11",
        primary
          ? "[background:var(--grad-hero)] text-black shadow-[0_8px_20px_-6px_rgba(255,77,168,0.6)]"
          : "bg-white/10 text-white backdrop-blur-md",
      )}
    >
      {label}
    </button>
  );
}

interface GameHooks {
  onScore: (s: number) => void;
  onWin: () => void;
  onLose: () => void;
}

function makeGame(
  kind: GameKind,
  hue: number,
  renderer: THREE.WebGLRenderer,
  hooks: GameHooks,
): { api: GameApi } {
  switch (kind) {
    case "platformer":
      return { api: makePlatformer(renderer, hue, hooks) };
    case "collect":
      return { api: makeCollector(renderer, hue, hooks) };
    case "dodger":
      return { api: makeDodger(renderer, hue, hooks) };
    case "maze":
      return { api: makeMaze(renderer, hue, hooks) };
    case "arena":
      return { api: makeArena(renderer, hue, hooks) };
  }
}

function hslColor(h: number, s: number, l: number) {
  return new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
}

function setupBaseScene(renderer: THREE.WebGLRenderer, hue: number) {
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.Fog(hslColor(hue, 30, 8).getHex(), 18, 60);
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 10, 5);
  scene.add(ambient, dir);
  const hemi = new THREE.HemisphereLight(
    hslColor(hue, 80, 65).getHex(),
    hslColor(hue + 120, 50, 20).getHex(),
    0.5,
  );
  scene.add(hemi);
  return { scene };
}

// PLATFORMER
function makePlatformer(renderer: THREE.WebGLRenderer, hue: number, hooks: GameHooks): GameApi {
  const { scene } = setupBaseScene(renderer, hue);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 4, 9);

  const player = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 24, 24),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue, 90, 65),
      emissive: hslColor(hue, 90, 30),
      emissiveIntensity: 0.4,
    }),
  );
  player.position.set(0, 1, 0);
  scene.add(player);

  const platforms: { mesh: THREE.Mesh; w: number; x: number; y: number; z: number }[] = [];
  const platMat = new THREE.MeshStandardMaterial({
    color: hslColor(hue + 40, 70, 55),
  });
  const layout = [
    { x: 0, y: 0, w: 4, z: 0 },
    { x: 3.5, y: 1, w: 1.6, z: 0 },
    { x: 6, y: 1.8, w: 1.6, z: 0 },
    { x: 8.6, y: 2.6, w: 1.6, z: 0 },
    { x: 12, y: 1.4, w: 2.4, z: 0 },
    { x: 15.4, y: 2.4, w: 1.6, z: 0 },
    { x: 18.6, y: 3.2, w: 2, z: 0 },
  ];
  for (const p of layout) {
    const geo = new THREE.BoxGeometry(p.w, 0.4, 1.4);
    const m = new THREE.Mesh(geo, platMat);
    m.position.set(p.x, p.y, p.z);
    scene.add(m);
    platforms.push({ mesh: m, w: p.w, x: p.x, y: p.y, z: p.z });
  }

  // Goal
  const goal = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.12, 16, 32),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue + 80, 90, 65),
      emissive: hslColor(hue + 80, 90, 50),
      emissiveIntensity: 0.6,
    }),
  );
  goal.position.set(layout[layout.length - 1].x, layout[layout.length - 1].y + 0.8, 0);
  scene.add(goal);

  const stars: THREE.Mesh[] = [];
  for (const p of layout.slice(1, -1)) {
    const s = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({
        color: hslColor(hue + 60, 95, 70),
        emissive: hslColor(hue + 60, 95, 50),
        emissiveIntensity: 0.7,
      }),
    );
    s.position.set(p.x, p.y + 0.7, p.z);
    scene.add(s);
    stars.push(s);
  }

  const vel = new THREE.Vector2(0, 0);
  let onGround = false;
  let jumpCD = 0;
  let score = 0;
  let alive = true;
  let won = false;
  let paused = false;
  let input: GameInput = { left: false, right: false, up: false, down: false, jump: false, action: false };
  let raf = 0;

  const clock = new THREE.Clock();

  function resize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function loop() {
    raf = requestAnimationFrame(loop);
    if (paused) {
      renderer.render(scene, camera);
      return;
    }
    const dt = Math.min(0.05, clock.getDelta());

    if (alive && !won) {
      const accel = 18;
      const targetVx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      vel.x += (targetVx * 6 - vel.x) * Math.min(1, dt * 8);
      vel.y -= 24 * dt; // gravity

      if ((input.jump || input.up) && onGround && jumpCD <= 0) {
        vel.y = 9;
        onGround = false;
        jumpCD = 0.2;
      }
      jumpCD -= dt;

      // Integrate
      player.position.x += vel.x * dt;
      player.position.y += vel.y * dt;

      // Collisions with platforms (top only)
      onGround = false;
      for (const p of platforms) {
        if (
          Math.abs(player.position.x - p.x) < p.w / 2 + 0.4 &&
          player.position.y - 0.4 <= p.y + 0.2 &&
          player.position.y - 0.4 >= p.y - 0.4 &&
          vel.y <= 0
        ) {
          player.position.y = p.y + 0.2 + 0.4;
          vel.y = 0;
          onGround = true;
        }
      }

      // Stars
      for (const s of stars) {
        if (s.visible && s.position.distanceTo(player.position) < 0.5) {
          s.visible = false;
          score += 1;
          hooks.onScore(score);
        }
      }
      // Goal
      if (goal.position.distanceTo(player.position) < 0.7) {
        won = true;
        hooks.onWin();
      }
      // Falling = lose
      if (player.position.y < -8) {
        alive = false;
        hooks.onLose();
      }

      // Camera follow
      camera.position.x += (player.position.x - camera.position.x) * Math.min(1, dt * 4);
      camera.position.y += (player.position.y + 1.5 - camera.position.y) * Math.min(1, dt * 3);
      camera.lookAt(player.position.x + 1, player.position.y, 0);
    }

    // Star spin
    for (const s of stars) s.rotation.y += dt * 2;
    goal.rotation.y += dt * 2;

    renderer.render(scene, camera);
  }
  loop();

  return {
    destroy: () => cancelAnimationFrame(raf),
    resize,
    setPaused: (p) => (paused = p),
    setInput: (i) => (input = i),
  };
}

// COLLECTOR
function makeCollector(renderer: THREE.WebGLRenderer, hue: number, hooks: GameHooks): GameApi {
  const { scene } = setupBaseScene(renderer, hue);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 12, 12);
  camera.lookAt(0, 0, 0);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(14, 48),
    new THREE.MeshStandardMaterial({ color: hslColor(hue, 50, 18) }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Decorative grid spots
  for (let i = 0; i < 12; i++) {
    const r = new THREE.Mesh(
      new THREE.CircleGeometry(0.6 + Math.random() * 0.4, 16),
      new THREE.MeshStandardMaterial({ color: hslColor(hue + i * 12, 40, 22) }),
    );
    r.rotation.x = -Math.PI / 2;
    r.position.set((Math.random() - 0.5) * 22, 0.01, (Math.random() - 0.5) * 22);
    scene.add(r);
  }

  const player = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 24),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue, 90, 65),
      emissive: hslColor(hue, 90, 35),
      emissiveIntensity: 0.6,
    }),
  );
  player.position.y = 0.5;
  scene.add(player);

  const items: THREE.Mesh[] = [];
  const ITEM_COUNT = 12;
  function spawnItems() {
    for (const it of items) scene.remove(it);
    items.length = 0;
    for (let i = 0; i < ITEM_COUNT; i++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({
          color: hslColor(hue + 60 + i * 8, 90, 65),
          emissive: hslColor(hue + 60, 90, 40),
          emissiveIntensity: 0.5,
        }),
      );
      cube.position.set(
        (Math.random() - 0.5) * 22,
        0.4,
        (Math.random() - 0.5) * 22,
      );
      cube.userData.t = Math.random() * 6.28;
      scene.add(cube);
      items.push(cube);
    }
  }
  spawnItems();

  let score = 0;
  let timeLeft = 25;
  let paused = false;
  let raf = 0;
  let input: GameInput = { left: false, right: false, up: false, down: false, jump: false, action: false };
  const clock = new THREE.Clock();

  function resize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function loop() {
    raf = requestAnimationFrame(loop);
    if (paused) {
      renderer.render(scene, camera);
      return;
    }
    const dt = Math.min(0.05, clock.getDelta());
    timeLeft -= dt;
    if (timeLeft <= 0) {
      paused = true;
      if (score >= 8) hooks.onWin();
      else hooks.onLose();
    }

    const speed = 7;
    const vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const vz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    player.position.x += vx * speed * dt;
    player.position.z += vz * speed * dt;
    player.position.x = Math.max(-13, Math.min(13, player.position.x));
    player.position.z = Math.max(-13, Math.min(13, player.position.z));

    for (const it of items) {
      if (!it.visible) continue;
      it.userData.t += dt * 2;
      it.position.y = 0.4 + Math.sin(it.userData.t) * 0.15;
      it.rotation.y += dt * 2;
      if (it.position.distanceTo(player.position) < 0.8) {
        it.visible = false;
        score += 1;
        hooks.onScore(score);
        if (score >= ITEM_COUNT) {
          paused = true;
          hooks.onWin();
        }
      }
    }

    // Camera tracking
    const camTarget = new THREE.Vector3(player.position.x, 12, player.position.z + 10);
    camera.position.lerp(camTarget, Math.min(1, dt * 3));
    camera.lookAt(player.position.x, 0, player.position.z);

    renderer.render(scene, camera);
  }
  loop();

  return {
    destroy: () => cancelAnimationFrame(raf),
    resize,
    setPaused: (p) => (paused = p),
    setInput: (i) => (input = i),
  };
}

// DODGER
function makeDodger(renderer: THREE.WebGLRenderer, hue: number, hooks: GameHooks): GameApi {
  const { scene } = setupBaseScene(renderer, hue);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 6, 8);
  camera.lookAt(0, 0, -2);

  const lane = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 100),
    new THREE.MeshStandardMaterial({ color: hslColor(hue, 50, 14) }),
  );
  lane.rotation.x = -Math.PI / 2;
  lane.position.z = -40;
  scene.add(lane);

  // Lane lines
  for (let i = -40; i < 40; i += 4) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 1.4),
      new THREE.MeshStandardMaterial({
        color: hslColor(hue + 50, 90, 70),
        emissive: hslColor(hue + 50, 90, 60),
        emissiveIntensity: 0.6,
      }),
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.01, i);
    scene.add(line);
  }

  const player = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 1.2),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue, 90, 65),
      emissive: hslColor(hue, 90, 40),
      emissiveIntensity: 0.5,
    }),
  );
  player.position.y = 0.6;
  scene.add(player);

  type Obs = { mesh: THREE.Mesh; speed: number };
  const obstacles: Obs[] = [];

  function spawnObstacle() {
    const lane = (Math.floor(Math.random() * 5) - 2) * 1.6;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshStandardMaterial({ color: hslColor((hue + Math.random() * 120) % 360, 90, 60) }),
    );
    m.position.set(lane, 0.5, -50);
    scene.add(m);
    obstacles.push({ mesh: m, speed: 14 + Math.random() * 6 });
  }

  let score = 0;
  let alive = true;
  let paused = false;
  let raf = 0;
  let spawnT = 0;
  let input: GameInput = { left: false, right: false, up: false, down: false, jump: false, action: false };
  const clock = new THREE.Clock();

  function resize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function loop() {
    raf = requestAnimationFrame(loop);
    if (paused) {
      renderer.render(scene, camera);
      return;
    }
    const dt = Math.min(0.05, clock.getDelta());

    if (alive) {
      const targetX = ((input.right ? 1 : 0) - (input.left ? 1 : 0));
      player.position.x += targetX * 9 * dt;
      player.position.x = Math.max(-3.6, Math.min(3.6, player.position.x));
      player.rotation.z = -targetX * 0.2;

      spawnT -= dt;
      if (spawnT <= 0) {
        spawnObstacle();
        spawnT = Math.max(0.25, 0.9 - score * 0.01);
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.mesh.position.z += o.speed * dt;
        o.mesh.rotation.x += dt * 2;
        if (o.mesh.position.z > 6) {
          scene.remove(o.mesh);
          obstacles.splice(i, 1);
          score += 1;
          hooks.onScore(score);
          continue;
        }
        if (
          Math.abs(o.mesh.position.x - player.position.x) < 0.85 &&
          Math.abs(o.mesh.position.z - player.position.z) < 0.85
        ) {
          alive = false;
          paused = true;
          hooks.onLose();
        }
      }

      if (score >= 30) {
        paused = true;
        hooks.onWin();
      }
    }
    renderer.render(scene, camera);
  }
  loop();

  return {
    destroy: () => cancelAnimationFrame(raf),
    resize,
    setPaused: (p) => (paused = p),
    setInput: (i) => (input = i),
  };
}

// MAZE
function makeMaze(renderer: THREE.WebGLRenderer, hue: number, hooks: GameHooks): GameApi {
  const { scene } = setupBaseScene(renderer, hue);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);
  camera.position.set(0, 14, 1);
  camera.lookAt(0, 0, 0);

  const SIZE = 11;
  const grid: number[][] = [];
  for (let y = 0; y < SIZE; y++) {
    const row: number[] = [];
    for (let x = 0; x < SIZE; x++) {
      const wall = x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1 || Math.random() < 0.28;
      row.push(wall ? 1 : 0);
    }
    grid.push(row);
  }
  // Carve a path
  let cx = 1, cy = 1;
  grid[cy][cx] = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
    ];
    const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
    const nx = Math.max(1, Math.min(SIZE - 2, cx + dx));
    const ny = Math.max(1, Math.min(SIZE - 2, cy + dy));
    grid[ny][nx] = 0;
    cx = nx; cy = ny;
  }
  grid[1][1] = 0;
  grid[SIZE - 2][SIZE - 2] = 0;

  const wallMat = new THREE.MeshStandardMaterial({ color: hslColor(hue + 30, 60, 35) });
  const floorMat = new THREE.MeshStandardMaterial({ color: hslColor(hue, 30, 12) });
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (grid[y][x] === 1) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 1), wallMat);
        m.position.set(x - SIZE / 2 + 0.5, 0.6, y - SIZE / 2 + 0.5);
        scene.add(m);
      } else {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), floorMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x - SIZE / 2 + 0.5, 0, y - SIZE / 2 + 0.5);
        scene.add(m);
      }
    }
  }

  const player = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 24, 24),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue, 90, 65),
      emissive: hslColor(hue, 90, 40),
      emissiveIntensity: 0.7,
    }),
  );
  player.position.set(1 - SIZE / 2 + 0.5, 0.4, 1 - SIZE / 2 + 0.5);
  scene.add(player);

  const goalCell = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.08, 16, 32),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue + 80, 90, 65),
      emissive: hslColor(hue + 80, 90, 50),
      emissiveIntensity: 0.7,
    }),
  );
  goalCell.position.set(SIZE - 2 - SIZE / 2 + 0.5, 0.5, SIZE - 2 - SIZE / 2 + 0.5);
  goalCell.rotation.x = Math.PI / 2;
  scene.add(goalCell);

  let paused = false;
  let raf = 0;
  let won = false;
  let input: GameInput = { left: false, right: false, up: false, down: false, jump: false, action: false };
  const clock = new THREE.Clock();
  let score = 0;

  function resize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function isWallAt(wx: number, wz: number) {
    const gx = Math.floor(wx + SIZE / 2);
    const gz = Math.floor(wz + SIZE / 2);
    if (gx < 0 || gx >= SIZE || gz < 0 || gz >= SIZE) return true;
    return grid[gz][gx] === 1;
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (paused) {
      renderer.render(scene, camera);
      return;
    }
    const dt = Math.min(0.05, clock.getDelta());

    if (!won) {
      const speed = 4.2;
      const vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const vz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      const nx = player.position.x + vx * speed * dt;
      const nz = player.position.z + vz * speed * dt;
      if (!isWallAt(nx, player.position.z)) player.position.x = nx;
      if (!isWallAt(player.position.x, nz)) player.position.z = nz;

      if (player.position.distanceTo(goalCell.position) < 0.6) {
        won = true;
        score += 1;
        hooks.onScore(score);
        hooks.onWin();
      }
    }

    goalCell.rotation.z += dt * 3;

    // Top-down camera follows
    camera.position.x += (player.position.x - camera.position.x) * Math.min(1, dt * 4);
    camera.position.z += (player.position.z + 0.001 - camera.position.z) * Math.min(1, dt * 4);
    camera.lookAt(player.position.x, 0, player.position.z);

    renderer.render(scene, camera);
  }
  loop();

  return {
    destroy: () => cancelAnimationFrame(raf),
    resize,
    setPaused: (p) => (paused = p),
    setInput: (i) => (input = i),
  };
}

// ARENA
function makeArena(renderer: THREE.WebGLRenderer, hue: number, hooks: GameHooks): GameApi {
  const { scene } = setupBaseScene(renderer, hue);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 12, 12);
  camera.lookAt(0, 0, 0);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(12, 48),
    new THREE.MeshStandardMaterial({ color: hslColor(hue, 40, 14) }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(11.8, 0.2, 16, 64),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue + 50, 90, 60),
      emissive: hslColor(hue + 50, 90, 40),
      emissiveIntensity: 0.5,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);

  const player = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.9, 16),
    new THREE.MeshStandardMaterial({
      color: hslColor(hue, 90, 70),
      emissive: hslColor(hue, 90, 40),
      emissiveIntensity: 0.5,
    }),
  );
  player.rotation.x = Math.PI / 2;
  player.position.y = 0.45;
  scene.add(player);

  type Foe = { mesh: THREE.Mesh; speed: number };
  type Bullet = { mesh: THREE.Mesh; vx: number; vz: number; life: number };
  const foes: Foe[] = [];
  const bullets: Bullet[] = [];

  function spawnFoe() {
    const angle = Math.random() * Math.PI * 2;
    const r = 11;
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshStandardMaterial({
        color: hslColor((hue + 180 + Math.random() * 60) % 360, 90, 60),
        emissive: hslColor(hue + 180, 90, 30),
        emissiveIntensity: 0.4,
      }),
    );
    m.position.set(Math.cos(angle) * r, 0.5, Math.sin(angle) * r);
    scene.add(m);
    foes.push({ mesh: m, speed: 1.5 + Math.random() * 1.5 });
  }

  let score = 0;
  let alive = true;
  let paused = false;
  let raf = 0;
  let aimDir = new THREE.Vector2(0, -1);
  let fireCD = 0;
  let spawnT = 0;
  let input: GameInput = { left: false, right: false, up: false, down: false, jump: false, action: false };
  const clock = new THREE.Clock();

  function resize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function loop() {
    raf = requestAnimationFrame(loop);
    if (paused) {
      renderer.render(scene, camera);
      return;
    }
    const dt = Math.min(0.05, clock.getDelta());

    if (alive) {
      const speed = 6.5;
      const vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const vz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      player.position.x += vx * speed * dt;
      player.position.z += vz * speed * dt;
      const r2 = player.position.x ** 2 + player.position.z ** 2;
      if (r2 > 11 * 11) {
        const a = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(a) * 11;
        player.position.z = Math.sin(a) * 11;
      }
      if (vx !== 0 || vz !== 0) {
        aimDir.set(vx, vz).normalize();
        player.rotation.z = -Math.atan2(vz, vx) - Math.PI / 2;
      }

      // Auto-fire when foes nearby OR when action pressed
      fireCD -= dt;
      if (fireCD <= 0 && (input.action || foes.length > 0)) {
        fireCD = 0.35;
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 12, 12),
          new THREE.MeshStandardMaterial({
            color: hslColor(hue + 60, 90, 70),
            emissive: hslColor(hue + 60, 90, 60),
            emissiveIntensity: 0.9,
          }),
        );
        b.position.copy(player.position);
        scene.add(b);
        // Pick nearest foe direction if not moving
        let dir = aimDir.clone();
        if (vx === 0 && vz === 0 && foes.length) {
          let nearest = foes[0];
          let best = Infinity;
          for (const f of foes) {
            const d = f.mesh.position.distanceTo(player.position);
            if (d < best) { best = d; nearest = f; }
          }
          dir.set(
            nearest.mesh.position.x - player.position.x,
            nearest.mesh.position.z - player.position.z,
          ).normalize();
        }
        bullets.push({ mesh: b, vx: dir.x * 14, vz: dir.y * 14, life: 1.4 });
      }

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.mesh.position.x += b.vx * dt;
        b.mesh.position.z += b.vz * dt;
        b.life -= dt;
        if (b.life <= 0) {
          scene.remove(b.mesh);
          bullets.splice(i, 1);
          continue;
        }
        for (let j = foes.length - 1; j >= 0; j--) {
          if (b.mesh.position.distanceTo(foes[j].mesh.position) < 0.55) {
            scene.remove(foes[j].mesh);
            foes.splice(j, 1);
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            score += 1;
            hooks.onScore(score);
            break;
          }
        }
      }

      // Foe spawn + chase
      spawnT -= dt;
      if (spawnT <= 0) {
        spawnFoe();
        spawnT = Math.max(0.4, 1.4 - score * 0.04);
      }
      for (const f of foes) {
        const dx = player.position.x - f.mesh.position.x;
        const dz = player.position.z - f.mesh.position.z;
        const d = Math.hypot(dx, dz) || 1;
        f.mesh.position.x += (dx / d) * f.speed * dt;
        f.mesh.position.z += (dz / d) * f.speed * dt;
        f.mesh.rotation.y += dt * 4;
        if (d < 0.7) {
          alive = false;
          paused = true;
          hooks.onLose();
        }
      }

      if (score >= 25) {
        paused = true;
        hooks.onWin();
      }
    }

    camera.position.x += (player.position.x * 0.4 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.z += (player.position.z * 0.4 + 12 - camera.position.z) * Math.min(1, dt * 2);
    camera.lookAt(player.position.x, 0, player.position.z);

    renderer.render(scene, camera);
  }
  loop();

  return {
    destroy: () => cancelAnimationFrame(raf),
    resize,
    setPaused: (p) => (paused = p),
    setInput: (i) => (input = i),
  };
}
