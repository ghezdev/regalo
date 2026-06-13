# Plaza Image-Based Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the procedural plaza (generated tiles + pixel-art sprites) with a real background image, real character PNG sprites, and physics boundaries traced from a limits reference image.

**Architecture:** `BootScene` loads all PNGs and assembles per-character spritesheets at runtime using `createCanvas`; `PlazaScene` renders the background image and places invisible rectangle colliders. The existing `movement.ts`, `dialogue.ts`, `interactions.ts`, and `audio.ts` systems are reused unchanged.

**Tech Stack:** Phaser 3, Next.js 15, TypeScript

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `public/sprites` | Create (symlink) | Serve sprite assets to Phaser via HTTP |
| `src/game/config.ts` | Modify | Add `WORLD_WIDTH`, `WORLD_HEIGHT` constants |
| `src/game/types/content.ts` | Modify | Add `ImageMapCollider`, `ImagePlazaMap`; update `CharacterDefinition` |
| `src/game/data/maps/plaza.ts` | Replace | World-pixel spawn, colliders, interaction zones |
| `src/game/data/characters.ts` | Modify | Update `frameWidth`/`frameHeight` to 50 |
| `src/game/scenes/BootScene.ts` | Rewrite | Load PNGs, assemble spritesheets, register animations |
| `src/game/scenes/PlazaScene.ts` | Rewrite | Image background, physics walls, player, camera, F-key toggle |
| `src/game/systems/decor.ts` | Delete | Procedural decor — no longer used |

---

## Task 1: Public sprites symlink + config constants

**Files:**
- Create: `public/sprites` (symlink)
- Modify: `src/game/config.ts`

- [ ] **Step 1: Create symlink so Next.js serves sprites**

```bash
cd /home/guille/code/regalo
ln -s ../sprites public/sprites
```

Verify: `ls public/sprites/personajes/naomi_01.png` should succeed.

- [ ] **Step 2: Add world size constants to config**

Replace the contents of `src/game/config.ts`:

```typescript
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 240;
export const TILE_SIZE = 16;
export const PLAYER_SPEED = 90;
export const WORLD_WIDTH = 2009;
export const WORLD_HEIGHT = 1273;
```

- [ ] **Step 3: Type-check**

```bash
cd /home/guille/code/regalo
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add public/sprites src/game/config.ts
git commit -m "feat(plaza): add public sprites symlink and world size constants"
```

---

## Task 2: Update types

**Files:**
- Modify: `src/game/types/content.ts`
- Modify: `src/game/data/characters.ts`

- [ ] **Step 1: Add `ImageMapCollider` and `ImagePlazaMap` to content types**

In `src/game/types/content.ts`, append after the existing `PlazaMapDefinition`:

```typescript
export interface ImageMapCollider {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImagePlazaMap {
  width: number;
  height: number;
  spawn: Record<string, { x: number; y: number }>;
  colliders: ImageMapCollider[];
  interactions: MapInteraction[];
}
```

`MapInteraction` is already defined in this file (id, label, targetName, x, y, width, height, interactionId) — reuse it as-is.

- [ ] **Step 2: Update `CharacterDefinition` frame dimensions**

In `src/game/data/characters.ts`, update both character entries:

```typescript
import type { CharacterDefinition } from "../types/content";

export const characters: Record<string, CharacterDefinition> = {
  naomi: {
    id: "naomi",
    name: "Naomi",
    textureKey: "character-naomi",
    frameWidth: 50,
    frameHeight: 50,
    spawn: { x: 0, y: 0 }, // overridden by map data
  },
  guillermo: {
    id: "guillermo",
    name: "Guillermo",
    textureKey: "character-guillermo",
    frameWidth: 50,
    frameHeight: 50,
    spawn: { x: 0, y: 0 }, // overridden by map data
  },
};
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors (spawn type is `GridPoint = { x: number; y: number }` — compatible).

- [ ] **Step 4: Commit**

```bash
git add src/game/types/content.ts src/game/data/characters.ts
git commit -m "feat(plaza): add ImagePlazaMap type, update character frame size to 50px"
```

---

## Task 3: Replace plaza map data

**Files:**
- Replace: `src/game/data/maps/plaza.ts`

- [ ] **Step 1: Replace the file with world-pixel map data**

```typescript
import type { ImagePlazaMap } from "../../types/content";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../../config";

// All coordinates are world pixels (image is 2009×1273).
// Collider values are initial approximations — calibrate by running the game.
export const plazaMap: ImagePlazaMap = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,

  spawn: {
    naomi: { x: 1420, y: 350 },
    guillermo: { x: 1400, y: 1180 },
  },

  // Thin wall rectangles tracing the white boundary from LIMITES v2.png.
  colliders: [
    // ── Horizontal path ──────────────────────────────
    { x: 293,  y: 531,  width: 10,  height: 170 }, // left cap
    { x: 303,  y: 531,  width: 1052, height: 10 }, // top wall (up to upper-right path)
    { x: 293,  y: 691,  width: 970, height: 10  }, // bottom wall
    // ── Upper-right path (to castle) ─────────────────
    { x: 1355, y: 253,  width: 82,  height: 10  }, // top cap
    { x: 1355, y: 263,  width: 10,  height: 278 }, // left wall
    { x: 1437, y: 263,  width: 10,  height: 278 }, // right wall
    // ── Right building zone ───────────────────────────
    { x: 1129, y: 253,  width: 226, height: 10  }, // top-left of right zone
    { x: 1585, y: 253,  width: 74,  height: 10  }, // top-right of right zone
    { x: 1649, y: 263,  width: 10,  height: 300 }, // far-right wall
    // ── Right connector (x:1526-1669, y:552-700) ─────
    { x: 1526, y: 552,  width: 143, height: 10  }, // top
    { x: 1659, y: 552,  width: 10,  height: 148 }, // right wall
    // ── Lower section left wall ───────────────────────
    { x: 1353, y: 700,  width: 10,  height: 572 }, // left wall going down
    // ── Top connector of lower section ───────────────
    { x: 1434, y: 698,  width: 10,  height: 84  }, // left side
    { x: 1623, y: 698,  width: 10,  height: 84  }, // right side
    { x: 1434, y: 782,  width: 199, height: 10  }, // bottom of connector
    // ── Right wall of lower section (diagonal approx) ─
    { x: 1572, y: 776,  width: 135, height: 10  }, // top
    { x: 1697, y: 786,  width: 10,  height: 350 }, // right wall
    { x: 1572, y: 1136, width: 135, height: 10  }, // bottom
    // ── South / campsite section ──────────────────────
    { x: 1440, y: 1073, width: 137, height: 10  }, // top
    { x: 1440, y: 1083, width: 10,  height: 188 }, // left wall
    { x: 1567, y: 1083, width: 10,  height: 188 }, // right wall
    { x: 1440, y: 1261, width: 137, height: 10  }, // bottom
    // ── Small fragment (right area) ───────────────────
    { x: 1631, y: 771,  width: 29,  height: 7   },
  ],

  interactions: [
    {
      id: "castle-entrance",
      label: "E",
      targetName: "Entrada al castillo",
      x: 1380, y: 340, width: 80, height: 40,
      interactionId: "castle-entrance",
    },
    {
      id: "entrada-izq",
      label: "E",
      targetName: "Entrada izquierda",
      x: 370, y: 545, width: 45, height: 30,
      interactionId: "entrada-izq",
    },
    {
      id: "discoteca",
      label: "E",
      targetName: "Discoteca",
      x: 1120, y: 550, width: 50, height: 30,
      interactionId: "discoteca",
    },
    {
      id: "entrada-der",
      label: "E",
      targetName: "Entrada derecha",
      x: 1630, y: 545, width: 45, height: 30,
      interactionId: "entrada-der",
    },
    {
      id: "zona-sur-der",
      label: "E",
      targetName: "Zona sur-derecha",
      x: 1620, y: 775, width: 50, height: 30,
      interactionId: "zona-sur-der",
    },
    {
      id: "fondo-sur",
      label: "E",
      targetName: "Campamento",
      x: 1360, y: 1245, width: 80, height: 30,
      interactionId: "fondo-sur",
    },
  ],
};
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors in `BootScene.ts` and `PlazaScene.ts` that import the old `plazaMap` shape — these will be fixed in subsequent tasks. If errors are ONLY in those files, proceed.

- [ ] **Step 3: Commit**

```bash
git add src/game/data/maps/plaza.ts
git commit -m "feat(plaza): replace tile-based map data with world-pixel coords"
```

---

## Task 4: Rewrite BootScene

**Files:**
- Rewrite: `src/game/scenes/BootScene.ts`

- [ ] **Step 1: Write the new BootScene**

Replace `src/game/scenes/BootScene.ts` entirely:

```typescript
import * as Phaser from "phaser";
import type { GameSession } from "../types/game";

export class BootScene extends Phaser.Scene {
  private session!: GameSession;

  constructor() {
    super("boot");
  }

  init(data: { session: GameSession }) {
    this.session = data.session;
  }

  preload() {
    // Background
    this.load.image("plaza-bg", "/sprites/regalo%20naomi%20plaza.webp");

    // Character frames: naomi_01..16, guille_01..16
    for (let i = 1; i <= 16; i++) {
      const pad = String(i).padStart(2, "0");
      this.load.image(`naomi-f${pad}`, `/sprites/personajes/naomi_${pad}.png`);
      this.load.image(`guille-f${pad}`, `/sprites/personajes/guille_${pad}.png`);
    }

    // Guille floor sprite
    this.load.image("guille-piso", "/sprites/personajes/guille_piso.png");
  }

  create() {
    this.buildSpritesheet("character-naomi", "naomi-f");
    this.buildSpritesheet("character-guillermo", "guille-f");
    this.createAnimations();
    this.scene.start("plaza", { session: this.session });
  }

  private buildSpritesheet(textureKey: string, framePrefix: string) {
    const FRAME_W = 50;
    const FRAME_H = 50;
    const TOTAL = 16;

    const canvas = this.textures.createCanvas(textureKey, FRAME_W * TOTAL, FRAME_H);
    if (!canvas) throw new Error(`Cannot create canvas for ${textureKey}`);

    const ctx = canvas.getContext();

    for (let i = 0; i < TOTAL; i++) {
      const key = `${framePrefix}${String(i + 1).padStart(2, "0")}`;
      const src = this.textures.get(key).getSourceImage() as HTMLImageElement;
      ctx.drawImage(src, i * FRAME_W, 0, FRAME_W, FRAME_H);
    }

    canvas.refresh();

    for (let i = 0; i < TOTAL; i++) {
      canvas.add(i, 0, i * FRAME_W, 0, FRAME_W, FRAME_H);
    }
  }

  private createAnimations() {
    const chars = [
      { textureKey: "character-naomi" },
      { textureKey: "character-guillermo" },
    ];
    const directions = ["down", "left", "right", "up"] as const;

    for (const { textureKey } of chars) {
      for (let d = 0; d < directions.length; d++) {
        const key = `${textureKey}-${directions[d]}`;
        if (this.anims.exists(key)) continue;
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(textureKey, {
            start: d * 4,
            end: d * 4 + 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
  }
}

export const BOOT_SCENE_COLORS = {
  SKY_TOP: 0x0d1330,
  SKY_BOTTOM: 0x24153b,
};
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors only in `PlazaScene.ts` (still importing old map shape). BootScene itself should be clean.

- [ ] **Step 3: Commit**

```bash
git add src/game/scenes/BootScene.ts
git commit -m "feat(boot): rewrite to load real PNG sprites and assemble spritesheets"
```

---

## Task 5: Rewrite PlazaScene

**Files:**
- Rewrite: `src/game/scenes/PlazaScene.ts`

- [ ] **Step 1: Write the new PlazaScene**

Replace `src/game/scenes/PlazaScene.ts` entirely:

```typescript
import * as Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, WORLD_WIDTH, WORLD_HEIGHT } from "../config";
import { plazaMap } from "../data/maps/plaza";
import { createAudioToggle } from "../systems/audio";
import { DialogueController } from "../systems/dialogue";
import { createInteractionPrompt, type ActiveInteraction } from "../systems/interactions";
import { createMovementKeys, resolveMovement, type MovementKeys } from "../systems/movement";
import type { GameSession } from "../types/game";

const UI_DEPTH = 100;

interface PlazaSceneData {
  session: GameSession;
}

export class PlazaScene extends Phaser.Scene {
  private session!: GameSession;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: MovementKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private floorKey!: Phaser.Input.Keyboard.Key;
  private dialogue!: DialogueController;
  private interactions: ActiveInteraction[] = [];
  private activeInteraction: ActiveInteraction | null = null;
  private guilleFloorActive = false;

  constructor() {
    super("plaza");
  }

  init(data: PlazaSceneData) {
    this.session = data.session;
  }

  create() {
    // ── World ──────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // ── Background ────────────────────────────────────────────────
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, "plaza-bg").setDepth(0);

    // ── Input ─────────────────────────────────────────────────────
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.movementKeys = createMovementKeys(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.floorKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // ── Collision walls ───────────────────────────────────────────
    const walls = this.physics.add.staticGroup();
    for (const c of plazaMap.colliders) {
      const rect = this.add.rectangle(
        c.x + c.width / 2,
        c.y + c.height / 2,
        c.width,
        c.height,
        0x000000,
        0,
      );
      this.physics.add.existing(rect, true);
      walls.add(rect);
    }

    // ── Player ────────────────────────────────────────────────────
    const spawn = plazaMap.spawn[this.session.characterId];
    const textureKey = `character-${this.session.characterId}`;

    this.player = this.physics.add
      .sprite(spawn.x, spawn.y, textureKey, 0)
      .setSize(30, 20)
      .setOffset(10, 28)
      .setDepth(1);

    this.player.setCollideWorldBounds(true);
    this.player.setData("lastDirection", "down");
    this.physics.add.collider(this.player, walls);

    // ── Systems ───────────────────────────────────────────────────
    this.dialogue = new DialogueController(this);
    createAudioToggle(this);

    this.interactions = plazaMap.interactions.map((zone) =>
      createInteractionPrompt(this, zone, 1),
    );

    // ── Camera ────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.0);
    this.cameras.main.setRoundPixels(true);

    // ── HUD ───────────────────────────────────────────────────────
    this.add
      .text(12, 10, `${this.session.displayName} en la plaza`, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f6f3ff",
      })
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);

    this.add
      .text(12, 24, "Mover: WASD/Flechas  Interactuar: E  Tirar: F", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#d4caef",
      })
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);
  }

  update() {
    // ── Interact / advance dialogue ────────────────────────────────
    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.enterKey)
    ) {
      if (this.dialogue.isVisible()) {
        this.dialogue.advance();
        return;
      }
      if (this.activeInteraction) {
        const entry = dialogues[this.activeInteraction.data.interactionId];
        if (entry) {
          this.dialogue.show(this.activeInteraction.data.targetName, entry.lines);
        }
      }
    }

    // ── Guille floor toggle ────────────────────────────────────────
    if (
      Phaser.Input.Keyboard.JustDown(this.floorKey) &&
      this.session.characterId === "guillermo"
    ) {
      this.guilleFloorActive = !this.guilleFloorActive;
      if (this.guilleFloorActive) {
        this.player.setTexture("guille-piso");
        this.player.anims.stop();
        this.player.setVelocity(0, 0);
      } else {
        this.player.setTexture("character-guillermo");
      }
    }

    // ── Block input while floor mode or dialogue active ────────────
    if (this.dialogue.isVisible() || this.guilleFloorActive) {
      this.player.setVelocity(0, 0);
      if (!this.guilleFloorActive) this.player.anims.stop();
      return;
    }

    // ── Movement ──────────────────────────────────────────────────
    resolveMovement(this.player, this.movementKeys, this.cursorKeys);
    this.refreshInteractionState();
  }

  private refreshInteractionState() {
    let next: ActiveInteraction | null = null;
    for (const interaction of this.interactions) {
      const overlaps = this.physics.overlap(this.player, interaction.zone);
      interaction.prompt.setVisible(overlaps && !this.dialogue.isVisible());
      if (overlaps) next = interaction;
    }
    this.activeInteraction = next;
  }
}
```

- [ ] **Step 2: Verify the `dialogues` import is at the top of the file**

The `update()` code above references `dialogues` — confirm the import is present:
```typescript
import { dialogues } from "../data/dialogues";
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors about `createInteractionPrompt` receiving `1` instead of `TILE_SIZE` — that's intentional (coords are already world pixels, multiplier is 1). If `interactions.ts` multiplies by `tileSize`, verify the call signature is satisfied.

- [ ] **Step 4: Check interactions.ts signature**

Open `src/game/systems/interactions.ts` and verify the third parameter. The current call is `createInteractionPrompt(this, zone, 1)` — the third param is a scale multiplier. If it multiplies `zone.x * tileSize`, passing `1` means coordinates are used as-is (world pixels). Confirm this is correct.

- [ ] **Step 5: Commit**

```bash
git add src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): rewrite scene with image background, physics walls, floor toggle"
```

---

## Task 6: Delete decor.ts and clean up imports

**Files:**
- Delete: `src/game/systems/decor.ts`

- [ ] **Step 1: Delete the file**

```bash
rm src/game/systems/decor.ts
```

- [ ] **Step 2: Verify no remaining imports**

```bash
grep -r "from.*decor" src/
```

Expected: no output. If any file still imports from `decor`, remove that import.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(plaza): delete procedural decor system"
```

---

## Task 7: Run and calibrate

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and log in. Select a character.

- [ ] **Step 2: Verify background renders**

The plaza image should appear as the game background. If it shows a blank screen, check the browser console for 404 errors on `/sprites/...` paths. Verify the symlink exists: `ls public/sprites/personajes/naomi_01.png`.

- [ ] **Step 3: Verify sprites animate**

The character should appear and walk with the correct sprite frames when moving with WASD/arrows. Confirm:
- Walking down shows front-facing frames (naomi_01–04 / guille_01–04)
- Walking up shows back-facing frames (naomi_13–16 / guille_13–16)
- Idle shows the correct standing frame

- [ ] **Step 4: Calibrate spawn points**

If either character spawns inside a wall or off-screen, adjust the spawn coordinates in `src/game/data/maps/plaza.ts`:
- `naomi.spawn` — should appear at the castle entrance path
- `guillermo.spawn` — should appear at the southern campsite

- [ ] **Step 5: Calibrate collision walls**

Walk along every boundary of the walkable area. For any place where the player can walk through a wall or gets blocked in an open area, adjust the corresponding collider in `plazaMap.colliders`. Each entry has `{ x, y, width, height }` in world pixels.

Use browser devtools: open the Phaser debug renderer by temporarily adding to `create()`:
```typescript
this.physics.world.createDebugGraphic();
```
This shows all physics bodies as colored overlays. Remove after calibration.

- [ ] **Step 6: Test guille floor toggle**

Select Guillermo. Press `F` — he should switch to the floor sprite and stop moving. Press `F` again — normal walking resumes. Verify Naomi does NOT respond to `F`.

- [ ] **Step 7: Test interaction zones**

Walk to each yellow zone and verify the `E` prompt appears. Press `E` and confirm the dialogue fires correctly.

- [ ] **Step 8: Remove debug renderer and commit**

```bash
git add src/game/data/maps/plaza.ts
git commit -m "feat(plaza): calibrate collision walls and spawn points"
```

---

## Task 8: Add placeholder dialogues for new zones

**Files:**
- Modify: `src/game/data/dialogues.ts`

The 6 interaction zones reference `interactionId` values that must exist in `dialogues.ts` or pressing `E` will silently do nothing.

- [ ] **Step 1: Add placeholder entries**

Open `src/game/data/dialogues.ts` and add these entries alongside the existing ones:

```typescript
"castle-entrance": { id: "castle-entrance", lines: ["La entrada al castillo..."] },
"entrada-izq":     { id: "entrada-izq",     lines: ["Entrada izquierda..."] },
"discoteca":       { id: "discoteca",        lines: ["La discoteca..."] },
"entrada-der":     { id: "entrada-der",      lines: ["Entrada derecha..."] },
"zona-sur-der":    { id: "zona-sur-der",     lines: ["Zona sur-derecha..."] },
"fondo-sur":       { id: "fondo-sur",        lines: ["El campamento..."] },
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/game/data/dialogues.ts
git commit -m "feat(plaza): add placeholder dialogues for new interaction zones"
```
