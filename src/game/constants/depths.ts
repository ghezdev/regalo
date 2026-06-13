/**
 * Depth constants for layering game objects.
 *
 * Y-based foot depth tops out at map height in px (~416). Screen-fixed layers
 * must sit above that so they are never occluded by world decor/player.
 */

export const GROUND_DEPTH = -1000;
export const LIGHT_DEPTH = -500;
export const OVERLAY_DEPTH = 9000; // night vignette (above world, below UI text)
export const PROMPT_DEPTH = 9500; // floating interaction bubbles
export const UI_DEPTH = 10000; // HUD + dialogue box

/** Depth so an object sorts by the Y of its base/feet. */
export function footDepth(worldY: number): number {
  return worldY;
}
