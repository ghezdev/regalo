import * as Phaser from "phaser";
import { plazaBanner } from "../data/dialogues";
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
// Y-based foot depth tops out at map height in px (~416). Screen-fixed layers
// must sit above that so they are never occluded by world decor/player.
export const OVERLAY_DEPTH = 9000; // night vignette (above world, below UI text)
export const PROMPT_DEPTH = 9500; // floating interaction bubbles
export const UI_DEPTH = 10000; // HUD + dialogue box

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
