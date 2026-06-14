import * as Phaser from "phaser";
import type { MapInteraction } from "../types/content";

export interface ActiveInteraction {
  zone: Phaser.GameObjects.Zone;
  data: MapInteraction;
  anchorX: number;
  anchorY: number;
}

export function createInteractionPrompt(
  scene: Phaser.Scene,
  interaction: MapInteraction,
  tileSize: number,
): ActiveInteraction {
  const zone = scene.add.zone(
    interaction.x * tileSize + (interaction.width * tileSize) / 2,
    interaction.y * tileSize + (interaction.height * tileSize) / 2,
    interaction.width * tileSize,
    interaction.height * tileSize,
  );
  scene.physics.add.existing(zone, true);

  return {
    zone,
    data: interaction,
    anchorX: zone.x,
    anchorY: Math.max(56, zone.y - interaction.height * tileSize * 0.5 - 24),
  };
}
