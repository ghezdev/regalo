import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { BootScene } from "./scenes/BootScene";
import { PlazaScene } from "./scenes/PlazaScene";
import { InteriorScene } from "./scenes/InteriorScene";
import type { GameSession } from "./types/game";
import { resetGameOverlayState } from "./ui-overlay-store";

export function createGame(container: HTMLElement, session: GameSession) {
  resetGameOverlayState();

  const resolution =
    typeof window === "undefined"
      ? 1
      : Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#0d1330",
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    autoRound: true,
    resolution,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene, PlazaScene, InteriorScene],
  });

  game.scene.start("boot", { session });

  return game;
}
