# Plaza Redesign — Image-Based Map

**Date:** 2026-06-13
**Branch:** plaza-redesign

## Overview

Replace the fully procedural plaza (generated tiles, buildings, pixel-art sprites) with a design based on real image assets: a hand-crafted background image, real character sprite PNGs, and physics boundaries traced from a reference limits image.

Same technology (Phaser + Next.js), same goals, fresh asset pipeline.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Collision approach | Invisible rectangles | Simple, performant, easy to tune |
| Characters | Two selectable (Guille / Naomi) | Same as before |
| Camera zoom | 1.0× | Sprites display at native 50px; more map visible |
| Dialogue system | Keep existing DialogueController | Marked for future redesign |
| Depth sorting | Flat (player always above background) | Background is a single image, no per-object depth |

---

## Section 1 — Asset Loading (BootScene rewrite)

`BootScene` is completely rewritten. The procedural pixel-art generator is removed.

**Files loaded in `preload()`:**
- Background: `sprites/regalo naomi plaza.webp` (2009×1273)
- 16 PNGs per character: `sprites/personajes/naomi_01.png` … `naomi_16.png` (same for guille)
- Floor sprite: `sprites/personajes/guille_piso.png`

**Spritesheet assembly in `create()`:**
For each character, a `RenderTexture` (800×50 px) is created, all 16 frames drawn in order left-to-right, saved as a named texture, and frame data registered. This keeps the existing Phaser animation system in `movement.ts` working without changes.

**Direction mapping (verified visually):**
- Frames 01–04 → walk down (front-facing)
- Frames 05–08 → walk left
- Frames 09–12 → walk right
- Frames 13–16 → walk up (back-facing)

Animations: 4 per character, 8fps, repeat -1. Idle shows frame 01 of current direction.

---

## Section 2 — PlazaScene rewrite

**World:**
- Bounds: 2009×1273 px (exact image dimensions)
- Background image at `(0, 0)`, `depth 0`
- All procedural render systems removed (`renderGround`, `renderDecor`, `renderBuilding`, `renderFountain`, etc.)

**Collision rectangles:**
Invisible `staticGroup` rectangles approximate the white boundary from `sprites/regalo naomi plaza LIMITES v2.png`. The boundary was traced pixel-by-pixel (8 connected components, all confirmed). Exact rectangle coordinates are defined in code and calibrated by running the game.

**Camera:**
- Zoom: `1.0×`
- Follows player with `lerp 0.12`
- Bounds clamped to world (2009×1273)
- No procedural vignette (image has its own atmosphere)

**Spawn points (world coordinates, to be calibrated):**
- Naomi: `(1420, 290)` — castle entrance
- Guille: `(1400, 1200)` — southern campsite

---

## Section 3 — Characters & Animation

**Sprites:** 50×50 px, 16 frames per character. Assembled into runtime spritesheet in BootScene (see Section 1).

**Movement:** `systems/movement.ts` reused without changes. Animations play via `sprite.anims.play('{key}-{direction}', true)`.

**Depth:** Background at `depth 0`, player sprite at `depth 1`. No Y-based depth sorting (background is flat image, no layered objects).

**Guille floor toggle (`guille_piso.png`):**
- Key: `F` (toggle)
- Only available when selected character is Guille
- On activate: movement disabled, texture swapped to `guille_piso.png`, animation stopped
- On deactivate: texture restored to walk spritesheet, movement re-enabled
- `guille_piso.png` loaded as a standalone image in BootScene (not part of the spritesheet)

---

## Section 4 — Interaction Zones

6 zones confirmed from pixel analysis of `LIMITES v2.png`. Each is an invisible trigger rectangle; entering shows the "E" prompt and pressing E triggers `DialogueController`.

| Zone | World coords (approx.) | Label |
|---|---|---|
| Entrada castillo | (1420, 290) | Castle entrance |
| Entrada izq. | (392, 557) | Left entrance |
| Discoteca | (1147, 565) | Dance floor |
| Entrada der. | (1652, 560) | Right entrance |
| Zona sur-der. | (1646, 786) | South-right zone |
| Fondo sur | (1400, 1259) | Southern campsite |

Exact sizes calibrated at runtime.

---

## Section 5 — What Changes vs What Stays

### Rewritten completely
- `src/game/scenes/BootScene.ts` — real PNG loading, RenderTexture assembly, no procedural art
- `src/game/scenes/PlazaScene.ts` — image background, rect collisions, updated spawn, no tiles/decor
- `src/game/data/maps/plaza.ts` — replaced with world-pixel coordinates (collisions, spawns, interaction zones)
- `src/game/systems/decor.ts` — **deleted** (no procedural decor)

### Kept without changes
- `GameShell.tsx`, `LoginScreen.tsx`, `GameCanvas.tsx`
- `systems/dialogue.ts` ← marked for future redesign
- `systems/movement.ts`
- `systems/interactions.ts`
- `systems/audio.ts`
- `types/`, `data/characters.ts`, `data/dialogues.ts`

### Modified lightly
- `config.ts` — add world size constants (`WORLD_WIDTH = 2009`, `WORLD_HEIGHT = 1273`)
- `data/characters.ts` — update `frameWidth`/`frameHeight` to 50, update spawn coords to world pixels

---

## Boundary Data (from pixel analysis)

8 connected white-pixel components confirmed as the walkable boundary, extracted from `sprites/regalo naomi plaza LIMITES v2.png` (2009×1273):

| Segment | Approx. bbox |
|---|---|
| Horizontal path (main) | (293, 531) → (1269, 700) |
| Upper-right section | (1129, 253) → (1659, 560) |
| Left wall, lower section | (1263, 702) → (1361, 1272) |
| Right wall, lower section | (1572, 776) → (1707, 1139) |
| Top-right connector | (1434, 698) → (1633, 792) |
| South / campsite section | (1440, 1073) → (1577, 1270) |
| Right connector | (1526, 552) → (1669, 698) |
| Small right fragment | (1631, 771) → (1660, 778) |

Collision rectangles are placed just outside these bboxes to block movement. Fine-tuned by playtest.

---

## Out of Scope (this phase)

- Dialogue system redesign (future)
- Interior scenes (dance floor, photos, castle, etc.)
- NPC companions / AI movement
- Music / audio changes
