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
