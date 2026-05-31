import * as Phaser from "phaser";
import { characters } from "../data/characters";
import type { GameSession } from "../types/game";

const SKY_TOP = 0x0d1330;
const SKY_BOTTOM = 0x24153b;

export class BootScene extends Phaser.Scene {
  private session!: GameSession;

  constructor() {
    super("boot");
  }

  init(data: { session: GameSession }) {
    this.session = data.session;
  }

  preload() {
    this.generateCharacterSheet("character-naomi", {
      hair: 0x6b295f,
      outfit: 0xf2b6d8,
      accent: 0xfff0f4,
    });
    this.generateCharacterSheet("character-guillermo", {
      hair: 0x47311d,
      outfit: 0x7aa2f7,
      accent: 0xf4e6d0,
    });
  }

  create() {
    this.createCharacterAnimations();
    this.scene.start("plaza", { session: this.session });
  }

  private createCharacterAnimations() {
    Object.values(characters).forEach((character) => {
      ["down", "left", "right", "up"].forEach((direction, index) => {
        const animationKey = `${character.textureKey}-${direction}`;
        if (this.anims.exists(animationKey)) {
          return;
        }

        this.anims.create({
          key: animationKey,
          frames: this.anims.generateFrameNumbers(character.textureKey, {
            start: index * 4,
            end: index * 4 + 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
      });
    });
  }

  private generateCharacterSheet(
    key: string,
    palette: { hair: number; outfit: number; accent: number },
  ) {
    const frameWidth = 16;
    const frameHeight = 20;
    const totalFrames = 16;
    const canvas = this.textures.createCanvas(key, frameWidth * totalFrames, frameHeight);

    if (!canvas) {
      throw new Error(`Unable to create texture canvas for ${key}.`);
    }

    const context = canvas.getContext();
    const directions = ["down", "left", "right", "up"] as const;

    directions.forEach((direction, directionIndex) => {
      for (let walkFrame = 0; walkFrame < 4; walkFrame += 1) {
        const frameIndex = directionIndex * 4 + walkFrame;
        const offsetX = frameIndex * frameWidth;

        context.clearRect(offsetX, 0, frameWidth, frameHeight);
        context.fillStyle = "#00000000";
        context.fillRect(offsetX, 0, frameWidth, frameHeight);

        const bob = walkFrame % 2 === 0 ? 0 : 1;
        const armOffset = walkFrame % 2 === 0 ? 1 : -1;

        this.drawPixelRect(context, offsetX + 5, 2, 6, 3, palette.hair);
        this.drawPixelRect(context, offsetX + 4, 5, 8, 5, 0xf4cfb4);
        this.drawPixelRect(context, offsetX + 5, 9, 6, 5, palette.outfit);
        this.drawPixelRect(context, offsetX + 4 + armOffset, 10, 1, 4, palette.accent);
        this.drawPixelRect(context, offsetX + 11 - armOffset, 10, 1, 4, palette.accent);

        if (direction === "up") {
          this.drawPixelRect(context, offsetX + 6, 5, 4, 1, palette.hair);
        } else if (direction === "left") {
          this.drawPixelRect(context, offsetX + 4, 6, 1, 1, 0x221611);
        } else if (direction === "right") {
          this.drawPixelRect(context, offsetX + 11, 6, 1, 1, 0x221611);
        } else {
          this.drawPixelRect(context, offsetX + 6, 6, 1, 1, 0x221611);
          this.drawPixelRect(context, offsetX + 9, 6, 1, 1, 0x221611);
        }

        this.drawPixelRect(context, offsetX + 5, 14 + bob, 2, 5, 0x2a2532);
        this.drawPixelRect(context, offsetX + 9, 14 - bob, 2, 5, 0x2a2532);
      }
    });

    canvas.refresh();

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
      canvas.add(
        frameIndex,
        0,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
      );
    }
  }

  private drawPixelRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
  ) {
    context.fillStyle = Phaser.Display.Color.IntegerToColor(color).rgba;
    context.fillRect(x, y, width, height);
  }
}

export const BOOT_SCENE_COLORS = {
  SKY_TOP,
  SKY_BOTTOM,
};
