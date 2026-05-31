# Plaza Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the visual quality of the nighttime plaza to a polished, FireRed-inspired pixel-art RPG look — and make the game full-bleed in the page — while keeping everything 100% procedural (no binary assets) and agent-editable.

**Architecture:** Extract all per-element drawing out of `PlazaScene` into a focused `systems/decor.ts` "decor builder" module of small drawing functions driven by `data/maps/plaza.ts`. `PlazaScene` becomes a thin orchestrator. Decor and the player are depth-sorted by Y so the character walks behind trees/buildings. The React shell drops the sidebar and frames the canvas full-bleed with minimal original chrome.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, Phaser 3.90. No test runner is installed and the project docs forbid over-architecture, so verification is **`npx tsc --noEmit` + `npm run lint` + `npm run build` + manual screenshot comparison** against `images/example game.png` (target) and `images/current game.png` (before). Each task ends in a verification checkpoint and a commit.

> **Note on commits:** the repo's `.git` directory is empty (not initialized). Task 1 initializes git so the per-task commit checkpoints work. If the user declines git, replace each `git commit` step with "run the verification checkpoint and pause for review."

---

## File Structure

- `src/game/systems/decor.ts` — **new.** All procedural drawing functions (ground, paths, fountain, buildings, lamps, trees, flowers, benches, mailbox) + shared depth/palette helpers. One responsibility: turn map data into Phaser game objects.
- `src/game/scenes/PlazaScene.ts` — **modify.** Becomes a thin orchestrator that calls `decor.ts`, wires physics/camera/input, manages depth-sort of the player, and atmosphere.
- `src/game/scenes/BootScene.ts` — unchanged (procedural character sheets stay).
- `src/game/data/maps/plaza.ts` — **modify.** Retune positions for clean composition.
- `src/game/data/dialogues.ts` — **modify.** Add fountain banner text (read it first; see Task 3).
- `src/game/systems/dialogue.ts` — **modify.** Restyle dialogue box.
- `src/game/systems/interactions.ts` — **modify.** Restyle + float-animate prompt.
- `src/components/GameShell.tsx` — **modify.** Remove sidebar; full-bleed layout; chrome buttons.
- `src/app/globals.css` — **modify.** New full-bleed layout + chrome button styles; update responsive breakpoints.

---

## Task 1: Initialize git so per-task commits work

**Files:** none (repo metadata only)

- [ ] **Step 1: Confirm repo is uninitialized**

Run: `git -C /home/guille/code/regalo rev-parse --is-inside-work-tree`
Expected: `fatal: not a git repository` (the `.git` dir is empty).

- [ ] **Step 2: Initialize and make a baseline commit**

```bash
cd /home/guille/code/regalo
git init
git add -A
git commit -m "chore: baseline before plaza visual redesign"
```

- [ ] **Step 3: Verify**

Run: `git -C /home/guille/code/regalo log --oneline -1`
Expected: one commit printed.

---

## Task 2: Scaffold `decor.ts` with shared helpers + ground/paths

**Files:**
- Create: `src/game/systems/decor.ts`
- Modify: `src/game/scenes/PlazaScene.ts` (replace `renderGround`)

This task introduces the module conventions used by every later task:
- `footDepth(worldY)` returns the depth value to assign so objects sort by their base Y.
- Ground sits at depth `-1000`; light pools at `-500`; decor uses `footDepth`; player uses its own Y (set in `PlazaScene.update`); HUD/vignette use depth `1000+` with `scrollFactor(0)`.
- Every decor function takes `(scene, map)` or `(scene, point, tileSize)` and returns the created object(s). No drawing logic lives in `PlazaScene`.

- [ ] **Step 1: Create `decor.ts` with palette + ground**

```ts
import * as Phaser from "phaser";
import type { PlazaMapDefinition } from "../types/content";

// Night plaza palette (see docs/art-direction.md): deep blues, violet shadows,
// warm gold light, rose flowers, deep greens, cool light stone paths.
export const PALETTE = {
  grassDark: 0x1b3a31,
  grassMid: 0x224a3d,
  grassBlade: 0x2c5e49,
  grassPebble: 0x18302a,
  pathStone: 0x9aa0b8,
  pathStoneAlt: 0x868ca6,
  pathEdge: 0x6f7390,
  pathGrout: 0x5b5f78,
} as const;

export const GROUND_DEPTH = -1000;
export const LIGHT_DEPTH = -500;

/** Depth so an object sorts by the Y of its base/feet. */
export function footDepth(worldY: number): number {
  return worldY;
}

function isPath(map: PlazaMapDefinition, x: number, y: number): boolean {
  return map.paths.some((p) => p.x === x && p.y === y);
}

/** True when the tile is grass but at least one orthogonal neighbour is a path. */
function isPathEdge(map: PlazaMapDefinition, x: number, y: number): boolean {
  if (isPath(map, x, y)) return false;
  return (
    isPath(map, x - 1, y) ||
    isPath(map, x + 1, y) ||
    isPath(map, x, y - 1) ||
    isPath(map, x, y + 1)
  );
}

/**
 * Draws the ground into a single generated texture: two-tone night grass with
 * scattered detail pixels, cobble paths with alternating stones + grout, and a
 * subtle lighter edge ring where grass meets a path.
 */
export function renderGround(scene: Phaser.Scene, map: PlazaMapDefinition): void {
  const ts = map.tileSize;
  const g = scene.add.graphics();

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const px = x * ts;
      const py = y * ts;

      if (isPath(map, x, y)) {
        const alt = (x + y) % 2 === 0;
        g.fillStyle(alt ? PALETTE.pathStone : PALETTE.pathStoneAlt, 1);
        g.fillRect(px, py, ts, ts);
        // grout lines
        g.fillStyle(PALETTE.pathGrout, 1);
        g.fillRect(px, py, ts, 1);
        g.fillRect(px, py, 1, ts);
        continue;
      }

      const checker = (x + y) % 2 === 0 ? PALETTE.grassMid : PALETTE.grassDark;
      g.fillStyle(checker, 1);
      g.fillRect(px, py, ts, ts);

      if (isPathEdge(map, x, y)) {
        g.fillStyle(PALETTE.pathEdge, 0.4);
        g.fillRect(px, py, ts, ts);
      }

      // deterministic scattered detail so it never reflows between renders
      const seed = (x * 7 + y * 13) % 11;
      if (seed === 0) {
        g.fillStyle(PALETTE.grassBlade, 1);
        g.fillRect(px + 4, py + 6, 1, 3);
        g.fillRect(px + 6, py + 5, 1, 4);
      } else if (seed === 4) {
        g.fillStyle(PALETTE.grassPebble, 1);
        g.fillRect(px + 9, py + 10, 2, 2);
      }
    }
  }

  g.generateTexture("plaza-ground", map.width * ts, map.height * ts);
  g.destroy();
  scene.add.image(0, 0, "plaza-ground").setOrigin(0).setDepth(GROUND_DEPTH);
}
```

- [ ] **Step 2: Use it from `PlazaScene` and delete the old `renderGround`**

In `src/game/scenes/PlazaScene.ts`: add `import { renderGround } from "../systems/decor";`, replace the `this.renderGround();` call in `create()` with `renderGround(this, plazaMap);`, and delete the private `renderGround()` method (lines ~88-115).

- [ ] **Step 3: Verify**

```bash
cd /home/guille/code/regalo
npx tsc --noEmit && npm run lint
```
Expected: no type errors, no lint errors. (Build is run at end of larger tasks; type-check here is enough.)

- [ ] **Step 4: Commit**

```bash
git add src/game/systems/decor.ts src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): procedural ground + path edges in decor module"
```

---

## Task 3: Fountain + romantic banner

**Files:**
- Modify: `src/game/systems/decor.ts`
- Modify: `src/game/data/dialogues.ts` (read first to match existing shape)
- Modify: `src/game/scenes/PlazaScene.ts`

The banner text must live in data, not in drawing code. First read `src/game/data/dialogues.ts` to see the exact export shape, then add a short banner constant in the data layer (placeholder, tagged for personalization).

- [ ] **Step 1: Add banner text to the data layer**

Read `src/game/data/dialogues.ts`. Add at the end (adjust to the file's actual export style):

```ts
// PLACEHOLDER — Guillermo: personalizar este texto del cartel de la fuente.
export const plazaBanner = {
  title: "Para Naomi",
  subtitle: "Tu plaza de recuerdos",
};
```

- [ ] **Step 2: Add `renderFountain` to `decor.ts`**

```ts
import { plazaBanner } from "../data/dialogues";

export const FOUNTAIN_PALETTE = {
  stoneLight: 0xb9bdd0,
  stoneMid: 0x8d92ab,
  stoneDark: 0x5f6480,
  waterLight: 0xa9c8ff,
  waterDark: 0x5f7fc4,
  waterFoam: 0xeaf2ff,
  glow: 0xbcd4ff,
} as const;

/**
 * Multi-tier stone fountain centred on the object's footprint, with an animated
 * water shimmer and a soft glow. Returns the foot Y for depth sorting by caller.
 */
export function renderFountain(
  scene: Phaser.Scene,
  worldX: number,
  worldY: number,
  width: number,
  height: number,
): void {
  const cx = worldX + width / 2;
  const cy = worldY + height / 2;
  const footY = worldY + height;

  // ground glow
  const glow = scene.add.ellipse(cx, cy + 4, width + 24, height + 14, FOUNTAIN_PALETTE.glow, 0.14);
  glow.setBlendMode(Phaser.BlendModes.ADD).setDepth(LIGHT_DEPTH);

  const container = scene.add.container(0, 0);
  // outer basin
  container.add(scene.add.ellipse(cx, cy + 6, width, height * 0.7, FOUNTAIN_PALETTE.stoneDark));
  container.add(scene.add.ellipse(cx, cy + 2, width, height * 0.7, FOUNTAIN_PALETTE.stoneMid));
  container.add(scene.add.ellipse(cx, cy, width - 6, height * 0.6, FOUNTAIN_PALETTE.stoneLight));
  // water
  const water = scene.add.ellipse(cx, cy, width - 14, height * 0.5, FOUNTAIN_PALETTE.waterDark);
  const waterTop = scene.add.ellipse(cx, cy - 1, width - 22, height * 0.4, FOUNTAIN_PALETTE.waterLight);
  container.add([water, waterTop]);
  // central pillar + spout
  container.add(scene.add.rectangle(cx, cy - 6, 6, 16, FOUNTAIN_PALETTE.stoneLight));
  const foam = scene.add.ellipse(cx, cy - 14, 10, 6, FOUNTAIN_PALETTE.waterFoam, 0.9);
  container.add(foam);
  container.setDepth(footDepth(footY));

  // gentle shimmer
  scene.tweens.add({
    targets: waterTop,
    scaleX: 1.06,
    scaleY: 0.92,
    alpha: 0.85,
    duration: 1600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.inOut",
  });
  scene.tweens.add({
    targets: foam,
    y: cy - 17,
    alpha: 0.6,
    duration: 1400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.inOut",
  });

  // wooden banner sign beside the fountain
  const bx = cx;
  const by = worldY - 14;
  const bannerBg = scene.add.rectangle(bx, by, 84, 24, 0x4a3526).setStrokeStyle(2, 0x6e4f37);
  const bannerTitle = scene.add
    .text(bx, by - 4, plazaBanner.title, { fontFamily: "monospace", fontSize: "9px", color: "#ffe6b0" })
    .setOrigin(0.5);
  const bannerSub = scene.add
    .text(bx, by + 6, plazaBanner.subtitle, { fontFamily: "monospace", fontSize: "7px", color: "#f3c9d9" })
    .setOrigin(0.5);
  const banner = scene.add.container(0, 0, [bannerBg, bannerTitle, bannerSub]);
  banner.setDepth(footDepth(by + 12));
}
```

- [ ] **Step 3: Call it from `PlazaScene` and remove the inline fountain block**

In `PlazaScene.renderDecor` (the `if (object.kind === "fountain")` block), replace the inline ellipse drawing with:
```ts
renderFountain(this, worldX, worldY, width, height);
```
Add `renderFountain` to the `decor` import.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/decor.ts src/game/data/dialogues.ts src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): detailed animated fountain + romantic banner"
```

---

## Task 4: Buildings with roof, sign, lit windows, door glow

**Files:**
- Modify: `src/game/systems/decor.ts`
- Modify: `src/game/scenes/PlazaScene.ts`

- [ ] **Step 1: Add `renderBuilding` to `decor.ts`**

```ts
interface BuildingPalette {
  wall: number;
  wallShade: number;
  roof: number;
  roofShade: number;
}

const BUILDING_PALETTES: Record<string, BuildingPalette> = {
  dance: { wall: 0xb85f77, wallShade: 0x8f4258, roof: 0x6b3e4b, roofShade: 0x4e2a36 },
  photos: { wall: 0x7f6cb0, wallShade: 0x5d4d8a, roof: 0x4a3765, roofShade: 0x342649 },
  audio: { wall: 0x55779e, wallShade: 0x3d597a, roof: 0x35455e, roofShade: 0x253245 },
  home: { wall: 0x9b7f69, wallShade: 0x75604e, roof: 0x6b3555, roofShade: 0x4a2239 },
};

const WINDOW_LIT = 0xffd98c;
const DOOR_DARK = 0x2a1a2e;
const DOOR_GLOW = 0xffcf73;
const SIGN_BG = 0x3a2a1f;
const SIGN_TEXT = "#ffe6b0";

export function renderBuilding(
  scene: Phaser.Scene,
  worldX: number,
  worldY: number,
  width: number,
  height: number,
  variant: string | undefined,
  label: string | undefined,
): void {
  const pal = BUILDING_PALETTES[variant ?? "home"] ?? BUILDING_PALETTES.home;
  const cx = worldX + width / 2;
  const footY = worldY + height;
  const roofH = Math.min(18, height * 0.45);
  const c = scene.add.container(0, 0);

  // wall body with right-side shade
  c.add(scene.add.rectangle(cx, worldY + roofH + (height - roofH) / 2, width, height - roofH, pal.wall));
  c.add(scene.add.rectangle(worldX + width - width * 0.18, worldY + roofH + (height - roofH) / 2, width * 0.18, height - roofH, pal.wallShade));

  // gabled roof: trapezoid via two stacked rects + ridge
  c.add(scene.add.rectangle(cx, worldY + roofH / 2 + 2, width + 8, roofH - 2, pal.roof));
  c.add(scene.add.rectangle(cx, worldY + 3, width * 0.62, 6, pal.roofShade));
  c.add(scene.add.rectangle(cx, worldY + roofH, width + 8, 2, pal.roofShade)); // ridge line

  // lit windows
  const winY = worldY + roofH + 10;
  c.add(scene.add.rectangle(worldX + 14, winY, 9, 9, WINDOW_LIT).setStrokeStyle(1, 0xfff3d6));
  c.add(scene.add.rectangle(worldX + width - 14, winY, 9, 9, WINDOW_LIT).setStrokeStyle(1, 0xfff3d6));

  // door + warm glow
  const doorGlow = scene.add.ellipse(cx, footY - 2, 26, 16, DOOR_GLOW, 0.22);
  doorGlow.setBlendMode(Phaser.BlendModes.ADD).setDepth(LIGHT_DEPTH);
  c.add(scene.add.rectangle(cx, footY - 11, 14, 22, DOOR_DARK).setStrokeStyle(1, 0xffcf73));

  c.setDepth(footDepth(footY));

  if (label) {
    const sign = scene.add.container(0, 0);
    sign.add(scene.add.rectangle(cx, worldY - 8, label.length * 5 + 12, 14, SIGN_BG).setStrokeStyle(1, 0x6e4f37));
    sign.add(scene.add.text(cx, worldY - 8, label, { fontFamily: "monospace", fontSize: "8px", color: SIGN_TEXT }).setOrigin(0.5));
    sign.setDepth(footDepth(footY) + 1);
  }
}
```

- [ ] **Step 2: Call from `PlazaScene` and delete the inline building block**

Replace the entire `if (object.kind === "building") { ... }` block in `renderDecor` with:
```ts
renderBuilding(this, worldX, worldY, width, height, object.variant, object.label);
```
Add `renderBuilding` to the import.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/game/systems/decor.ts src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): layered buildings with roof, sign, lit windows, door glow"
```

---

## Task 5: Lamps, trees, flowers, benches, mailbox (layered + depth-sorted)

**Files:**
- Modify: `src/game/systems/decor.ts`
- Modify: `src/game/scenes/PlazaScene.ts`

- [ ] **Step 1: Add the remaining decor functions to `decor.ts`**

```ts
export function renderLamp(scene: Phaser.Scene, worldX: number, worldY: number): void {
  const baseX = worldX + 8;
  const footY = worldY + 18;
  const pool = scene.add.ellipse(baseX, footY, 30, 12, 0xffd46a, 0.16);
  pool.setBlendMode(Phaser.BlendModes.ADD).setDepth(LIGHT_DEPTH);
  const glow = scene.add.circle(baseX, worldY + 4, 14, 0xffd46a, 0.22);
  glow.setBlendMode(Phaser.BlendModes.ADD).setDepth(LIGHT_DEPTH);
  const c = scene.add.container(0, 0, [
    scene.add.rectangle(baseX, worldY + 12, 3, 16, 0x4f4d64),
    scene.add.rectangle(baseX, worldY + 4, 7, 8, 0x6a6480),
    scene.add.rectangle(baseX, worldY + 4, 5, 6, 0xffe39a),
  ]);
  c.setDepth(footDepth(footY));
  scene.tweens.add({ targets: glow, alpha: 0.3, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.inOut" });
}

export function renderTree(scene: Phaser.Scene, worldX: number, worldY: number): void {
  const cx = worldX + 8;
  const footY = worldY + 22;
  const shadow = scene.add.ellipse(cx, footY, 22, 8, 0x000000, 0.22);
  shadow.setDepth(LIGHT_DEPTH);
  const c = scene.add.container(0, 0, [
    scene.add.rectangle(cx, worldY + 16, 6, 14, 0x5a3b28),
    scene.add.ellipse(cx, worldY + 8, 24, 22, 0x254f3f),
    scene.add.ellipse(cx, worldY + 6, 20, 18, 0x30614e),
    scene.add.ellipse(cx - 4, worldY + 3, 8, 7, 0x3c7a60),
  ]);
  c.setDepth(footDepth(footY));
}

const FLOWER_COLORS = [0xf0a6ca, 0xf6d5dc, 0xe75874, 0xffffff];

export function renderFlowerBed(scene: Phaser.Scene, worldX: number, worldY: number, index: number): void {
  const c = scene.add.container(worldX, worldY);
  c.add(scene.add.rectangle(8, 12, 12, 4, 0x1c3a2f)); // soil
  for (let i = 0; i < 3; i += 1) {
    const fx = 3 + i * 5;
    c.add(scene.add.rectangle(fx, 9, 1, 5, 0x2f8053)); // stem
    c.add(scene.add.rectangle(fx, 5, 4, 4, FLOWER_COLORS[(index + i) % FLOWER_COLORS.length]));
    c.add(scene.add.rectangle(fx, 5, 1, 1, 0xfff3d6)); // highlight
  }
  c.setDepth(footDepth(worldY + 14));
}

export function renderBench(scene: Phaser.Scene, worldX: number, worldY: number): void {
  const c = scene.add.container(worldX, worldY, [
    scene.add.rectangle(8, 7, 16, 3, 0x5a4234), // backrest
    scene.add.rectangle(8, 11, 16, 4, 0x8a5b45), // seat
    scene.add.rectangle(3, 15, 2, 5, 0x4a352b),
    scene.add.rectangle(13, 15, 2, 5, 0x4a352b),
  ]);
  c.setDepth(footDepth(worldY + 20));
}

export function renderMailbox(scene: Phaser.Scene, worldX: number, worldY: number, width: number, height: number): void {
  const cx = worldX + width / 2;
  const footY = worldY + height;
  const c = scene.add.container(0, 0, [
    scene.add.rectangle(cx, footY - 6, 4, 12, 0x5f4336), // post
    scene.add.rectangle(cx, worldY + 8, 14, 12, 0xc76067), // body
    scene.add.rectangle(cx, worldY + 4, 14, 4, 0xa84a52), // lid
    scene.add.rectangle(cx + 6, worldY + 8, 2, 6, 0xffe39a), // flag
  ]);
  c.setDepth(footDepth(footY));
}
```

- [ ] **Step 2: Rewire `PlazaScene.renderDecor` to call these**

Replace the `flowerBeds.forEach`, `trees.forEach`, `benches.forEach`, `lamps.forEach` loops (the inline-drawing versions) and the `mailbox` block with calls:
```ts
plazaMap.flowerBeds.forEach((p, i) => renderFlowerBed(this, p.x * TILE_SIZE, p.y * TILE_SIZE, i));
plazaMap.trees.forEach((p) => renderTree(this, p.x * TILE_SIZE, p.y * TILE_SIZE));
plazaMap.benches.forEach((p) => renderBench(this, p.x * TILE_SIZE, p.y * TILE_SIZE));
plazaMap.lamps.forEach((p) => renderLamp(this, p.x * TILE_SIZE, p.y * TILE_SIZE));
```
And in the `objects.forEach` loop replace the `if (object.kind === "mailbox")` block with:
```ts
renderMailbox(this, worldX, worldY, width, height);
```
Keep the solid-collider creation block at the end of `objects.forEach` unchanged. Add all new function names to the `decor` import. The old `decor` container variable and its `.add(...)` calls are no longer needed — remove the unused container.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean (watch for unused-variable lint errors from the removed container).

- [ ] **Step 4: Commit**

```bash
git add src/game/systems/decor.ts src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): layered lamps, trees, flowers, benches, mailbox"
```

---

## Task 6: Depth-sort the player by Y

**Files:**
- Modify: `src/game/scenes/PlazaScene.ts`

All decor now sets `depth = footY`. The player must update its depth each frame to its own Y so it passes behind/in front correctly.

- [ ] **Step 1: Set player depth dynamically**

In `PlazaScene.update()`, after `resolveMovement(...)` and before/after `refreshInteractionState()`, add:
```ts
this.player.setDepth(this.player.y);
```
Remove the fixed `.setDepth(10)` in `createPlayer()` (it is now overwritten every frame; leave an initial `this.player.setDepth(this.player.y)` after creation so the first frame is correct).

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean.

- [ ] **Step 3: Manual check**

Run `npm run dev`, log in as `naomi/luna`, walk up behind a tree and a building. Expected: the character is occluded by the canopy/roof when standing below it, and draws in front when standing below the base.

- [ ] **Step 4: Commit**

```bash
git add src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): depth-sort player by Y so it walks behind decor"
```

---

## Task 7: Atmosphere — fireflies + tuned vignette

**Files:**
- Modify: `src/game/scenes/PlazaScene.ts`

- [ ] **Step 1: Add a firefly particle emitter and keep the vignette**

In `createCamera()` (or a new `createAtmosphere()` called from `create()`), after the vignette, add a small generated dot texture + emitter:
```ts
// firefly dot texture
const dot = this.add.graphics();
dot.fillStyle(0xfff0b0, 1).fillCircle(2, 2, 2);
dot.generateTexture("firefly", 4, 4);
dot.destroy();

const emitter = this.add.particles(0, 0, "firefly", {
  x: { min: 0, max: plazaMap.width * TILE_SIZE },
  y: { min: 0, max: plazaMap.height * TILE_SIZE },
  lifespan: 4000,
  speedY: { min: -6, max: 6 },
  speedX: { min: -6, max: 6 },
  scale: { start: 0.8, end: 0 },
  alpha: { start: 0.0, end: 0.0 },
  frequency: 600,
  quantity: 1,
  blendMode: Phaser.BlendModes.ADD,
});
emitter.setDepth(LIGHT_DEPTH);
// twinkle: fade in then out over lifespan
emitter.addParticleProcessor({
  update: (p) => {
    const t = p.lifeT; // 0..1
    p.alpha = Math.sin(t * Math.PI) * 0.7;
  },
} as Phaser.Types.GameObjects.Particles.ParticleProcessor);
```
Import `LIGHT_DEPTH` from `decor` and `TILE_SIZE` is already imported. If the `addParticleProcessor` typing is awkward in this Phaser version, replace the twinkle with `alpha: { start: 0.7, end: 0 }` in the config and drop the processor block.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean. If the processor types error, apply the fallback noted above.

- [ ] **Step 3: Commit**

```bash
git add src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): firefly atmosphere particles"
```

---

## Task 8: Retune map composition

**Files:**
- Modify: `src/game/data/maps/plaza.ts`

Goal: fountain dead-centre, a clean cross/diamond of paths through it, buildings framing the perimeter with air, no collider blocking a main walkway, spawns on a path just below the fountain.

- [ ] **Step 1: Recompute layout**

Map is 40×26, tile 16. Center column ≈ 19-20, center row ≈ 12-13. Update `plaza.ts`:
- `spawn`: `naomi {x:19,y:16}`, `guillermo {x:20,y:16}` (on the vertical path below the fountain).
- `paths`: rebuild as a clean cross plus a ring. Horizontal run `y:13` from `x:6..33`; vertical run `x:19` and `x:20` from `y:3..22`; a square ring around the fountain at radius ~4. Use the existing `Array.from` generator style. Ensure every door tile connects to a path.
- `objects` fountain: `x:17,y:10,width:6,height:6` (centre ≈ 20,13).
- Buildings spread to the four edges with the doors facing inward, doors reachable from a path: `dance {x:3,y:4}`, `photos {x:30,y:4}`, `audio {x:3,y:18}`, `home {x:15,y:1,width:12,height:5}` top-centre.
- `mailbox {x:31,y:18}`.
- Move `lamps`, `trees`, `flowerBeds`, `benches` to line the paths and ring the fountain symmetrically (keep counts; just reposition for symmetry).
- Update each `interactions` entry's `x,y` so its zone sits on the path tile directly in front of the matching object's door.

Keep all ids, kinds, variants, labels, and the `PlazaMapDefinition` shape unchanged — only coordinates change.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean.

- [ ] **Step 3: Manual check**

Run `npm run dev`, log in, confirm: you spawn on a path below the fountain, can walk a clear cross to every building door, each `E` prompt appears at the right door, no collider traps you. Adjust coordinates if any door is unreachable or a path is blocked.

- [ ] **Step 4: Commit**

```bash
git add src/game/data/maps/plaza.ts
git commit -m "feat(plaza): retune map composition — centred fountain, clean paths"
```

---

## Task 9: Restyle dialogue, interaction prompt, HUD

**Files:**
- Modify: `src/game/systems/dialogue.ts`
- Modify: `src/game/systems/interactions.ts`
- Modify: `src/game/scenes/PlazaScene.ts` (HUD text in `createHud`)

- [ ] **Step 1: Dialogue box — double pixel border + name plate**

In `dialogue.ts` constructor, replace the single `panel` rectangle with a layered look: an outer border rect and an inner fill, plus a small name-plate rect behind `nameText`. Example replacement for the `panel` creation and `root` container contents:
```ts
const border = scene.add
  .rectangle(width / 2, height - 48, width - 20, 76, 0x2a2140)
  .setStrokeStyle(2, 0xe9d7a1)
  .setScrollFactor(0);
this.panel = scene.add
  .rectangle(width / 2, height - 48, width - 28, 64, 0x141029, 0.96)
  .setScrollFactor(0);
const namePlate = scene.add
  .rectangle(64, height - 76, 96, 16, 0x3a2a4f)
  .setStrokeStyle(1, 0xf7c9d9)
  .setScrollFactor(0);
```
Add `border` and `namePlate` to the `root` container array (before the text objects so text draws on top). Keep `nameText`, `bodyText`, `hintText` as-is.

- [ ] **Step 2: Interaction prompt — cleaner bubble + float tween**

In `interactions.ts`, after creating `prompt`, add a gentle vertical float and a small pointer. Replace the bubble fill color with `0x2a2140`, keep the gold stroke, and append before `return`:
```ts
scene.tweens.add({
  targets: prompt,
  y: prompt.y - 3,
  duration: 900,
  yoyo: true,
  repeat: -1,
  ease: "Sine.inOut",
});
```

- [ ] **Step 3: HUD name plate**

In `PlazaScene.createHud()`, wrap the player-name text in a small plate: before the text, add
```ts
this.add.rectangle(96, 15, 180, 18, 0x141029, 0.7).setScrollFactor(0).setDepth(39);
```
and bump both HUD text `setDepth` to `41`.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/dialogue.ts src/game/systems/interactions.ts src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): restyle dialogue, prompt, HUD to match romantic tone"
```

---

## Task 10: Full-bleed React shell + chrome buttons

**Files:**
- Modify: `src/components/GameShell.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Rewrite `GameShell` return — drop sidebar, add chrome**

Replace the authenticated `return (...)` JSX (the `<main className="game-layout">` block) with a full-bleed stage and minimal chrome. Keep `handleLogout`, `session`, and `GameCanvas` usage:
```tsx
return (
  <main className="game-screen">
    <div className="game-frame">
      <header className="game-topbar">
        <span className="game-title">La plaza de {session.displayName}</span>
        <div className="game-chrome">
          <button type="button" className="chrome-button" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
            {muted ? "Audio off" : "Audio on"}
          </button>
          <button type="button" className="chrome-button" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>
      <div className="game-stage-inner">
        <GameCanvas session={session} />
      </div>
    </div>
  </main>
);
```
Add `const [muted, setMuted] = useState(false);` near the other hooks. NOTE: wiring `muted` into Phaser audio is out of scope here (audio asset is still a placeholder per `docs/roadmap.md`); the button toggles UI state and is the hook point for later. Also update the loading-state `return` to use the same `game-screen`/`game-frame`/`game-stage-inner` classes (no `game-sidebar`/`night-frame game-layout`).

- [ ] **Step 2: Replace layout CSS in `globals.css`**

Replace the `.game-layout`, `.game-stage`, `.game-stage-inner`, `.game-sidebar`, `.sidebar-card`, `.session-row`, `.session-chip`, `.logout-wrap` rules (and the `.game-layout` entry in the `@media (max-width: 960px)` block) with full-bleed styles:
```css
.game-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.game-frame {
  position: relative;
  width: min(100%, 1040px);
  display: grid;
  gap: 0;
  border: 4px solid var(--border-dark);
  box-shadow: 0 0 0 4px var(--border-light), 0 18px 40px var(--shadow);
  background: linear-gradient(180deg, rgba(15, 12, 28, 0.94), rgba(24, 18, 42, 0.94));
}

.game-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 2px solid rgba(255, 214, 232, 0.2);
}

.game-title {
  font-size: 14px;
  color: var(--rose-soft);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.game-chrome {
  display: flex;
  gap: 8px;
}

.chrome-button {
  min-height: 32px;
  padding: 6px 12px;
  border: 2px solid var(--border-dark);
  background: rgba(38, 29, 61, 0.92);
  color: var(--text);
  cursor: pointer;
  text-transform: uppercase;
  font-size: 12px;
}

.chrome-button:hover {
  border-color: var(--gold);
}

.game-stage-inner {
  position: relative;
  display: grid;
  place-items: center;
  padding: 16px;
  background: linear-gradient(180deg, rgba(12, 9, 24, 0.96), rgba(23, 17, 39, 0.96));
}
```
Keep `.canvas-shell`, `.canvas-root`, and `canvas` rules as-is. In the `@media (max-width: 960px)` block, remove the now-dead `.game-layout` grid override; the new layout is single-column already.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Expected: clean (watch for unused imports/vars left from the old sidebar markup).

- [ ] **Step 4: Commit**

```bash
git add src/components/GameShell.tsx src/app/globals.css
git commit -m "feat(shell): full-bleed game frame, drop sidebar, minimal chrome"
```

---

## Task 11: Full verification + screenshot comparison

**Files:** none (validation only)

- [ ] **Step 1: Production build + lint**

```bash
cd /home/guille/code/regalo
npm run lint && npm run build
```
Expected: lint clean; build succeeds.

- [ ] **Step 2: Run the app and capture**

Run `npm run dev -- --hostname 127.0.0.1 --port 3001`. Open `http://127.0.0.1:3001`, log in as `naomi/luna`, capture a screenshot of `/game` (use the Playwright MCP browser tools available in this environment), and save it to `images/redesign-naomi.png`. Repeat for `guillermo/maia` → `images/redesign-guillermo.png`.

- [ ] **Step 3: Compare against targets**

Open `images/redesign-naomi.png` alongside `images/example game.png` (target tone) and `images/current game.png` (before). Confirm the success criteria from the spec: no sidebar, full-bleed game; paths read with edges; detailed fountain; buildings with roof/sign/lit windows; lamp glow; layered vegetation; player occluded by trees/buildings; restyled dialogue/HUD; no clipped/overlapping text; crisp pixels.

- [ ] **Step 4: Final commit**

```bash
git add images/redesign-naomi.png images/redesign-guillermo.png
git commit -m "test(plaza): redesign verification screenshots"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** shell redesign → Task 10; ground/paths → Task 2; fountain+banner → Task 3; buildings → Task 4; lamps/trees/flowers/benches/mailbox → Task 5; depth sort → Task 6; atmosphere → Task 7; map composition → Task 8; dialogue/prompt/HUD → Task 9; data-held romantic text → Task 3; verification → Task 11. No spec requirement is unmapped.
- **Placeholder scan:** the only "placeholder" is the intentional banner copy in data (spec requires placeholder romantic text tagged for personalization) — not a plan placeholder.
- **Type consistency:** `footDepth`, `GROUND_DEPTH`, `LIGHT_DEPTH`, `PALETTE`, `renderGround`, `renderFountain`, `renderBuilding`, `renderLamp`, `renderTree`, `renderFlowerBed`, `renderBench`, `renderMailbox`, `plazaBanner` are defined once and referenced with consistent names/signatures across tasks.
- **Deviation noted:** TDD red/green is replaced by type-check + lint + build + screenshot because no test runner is installed and the project docs forbid over-architecture; user/project instructions take precedence over the skill default.
