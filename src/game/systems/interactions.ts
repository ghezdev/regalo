import * as Phaser from "phaser";
import type { MapInteraction } from "../types/content";
import { PROMPT_DEPTH } from "../systems/decor";

export interface ActiveInteraction {
  zone: Phaser.GameObjects.Zone;
  prompt: Phaser.GameObjects.Container;
  data: MapInteraction;
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

  const bubble = scene.add.rectangle(0, 0, 32, 16, 0x2a2140, 0.92).setStrokeStyle(1, 0xe9d7a1);
  const text = scene.add.text(0, -1, interaction.label, {
    fontFamily: "monospace",
    fontSize: "10px",
    color: "#fff5da",
  });
  text.setOrigin(0.5, 0.5);

  const prompt = scene.add.container(zone.x, zone.y - tileSize, [bubble, text]);
  prompt.setDepth(PROMPT_DEPTH);
  prompt.setVisible(false);

  scene.tweens.add({
    targets: prompt,
    y: prompt.y - 3,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.inOut",
  });

  return { zone, prompt, data: interaction };
}
