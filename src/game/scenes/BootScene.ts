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
