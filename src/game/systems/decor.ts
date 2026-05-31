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
