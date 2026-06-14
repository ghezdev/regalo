import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { BootScene } from "./scenes/BootScene";
import { PlazaScene } from "./scenes/PlazaScene";
import { InteriorScene } from "./scenes/InteriorScene";
import type { GameSession } from "./types/game";
import { resetGameOverlayState } from "./ui-overlay-store";
import { MultiplayerClient } from "./systems/multiplayer";

export function createGame(container: HTMLElement, session: GameSession) {
  resetGameOverlayState();

  const partykitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";
  const multiplayer = new MultiplayerClient(partykitHost, session.characterId);

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

  game.registry.set("multiplayer", multiplayer);

  game.events.once("destroy", () => {
    multiplayer.destroy();
  });

  game.scene.start("boot", { session });

  return game;
}
