import * as Phaser from "phaser";
import { musicTracks } from "../data/music";

const BUTTON_SIZE = 26;
const BUTTON_PADDING = 16;
const ICON_COLOR = 0xf6edd1;
const FADE_DURATION = 2000;

let ambientUnlocked = false;
let activeScene: Phaser.Scene | null = null;

export function playAmbientMusic(scene: Phaser.Scene): void {
  if (ambientUnlocked) return;
  ambientUnlocked = true;
  activeScene = scene;

  const track = musicTracks.plazaNight;
  if (!track) return;
  if (!scene.cache.audio.exists(track.id)) return;

  const sound = scene.sound.add(track.id, { loop: track.loop, volume: 0 });
  sound.play();

  scene.tweens.add({
    targets: sound,
    volume: track.volume,
    duration: FADE_DURATION,
    ease: "Linear",
  });
}

export function pauseAmbientMusic(): void {
  const scene = getActiveScene();
  if (!scene) return;
  scene.sound.pauseAll();
}

export function resumeAmbientMusic(): void {
  const scene = getActiveScene();
  if (!scene) return;
  scene.sound.resumeAll();
}

function getActiveScene(): Phaser.Scene | null {
  return activeScene;
}

export function createAudioToggle(scene: Phaser.Scene) {
  const x = scene.scale.width - BUTTON_PADDING - BUTTON_SIZE / 2;
  const y = BUTTON_PADDING + BUTTON_SIZE / 2;

  const background = scene.add
    .rectangle(x, y, BUTTON_SIZE, BUTTON_SIZE, 0x000000, 0.76)
    .setStrokeStyle(1, ICON_COLOR, 0.18)
    .setScrollFactor(0)
    .setDepth(40)
    .setInteractive({ useHandCursor: true });

  const icon = scene.add.graphics().setScrollFactor(0).setDepth(41);
  let muted = false;

  const redrawIcon = () => {
    icon.clear();
    icon.lineStyle(1.8, ICON_COLOR, 1);

    const left = x - 7;
    const middle = x - 2;
    const speakerTip = x + 4;

    icon.lineBetween(left, y - 3, middle, y - 3);
    icon.lineBetween(middle, y - 3, speakerTip, y - 8);
    icon.lineBetween(speakerTip, y - 8, speakerTip, y + 8);
    icon.lineBetween(speakerTip, y + 8, middle, y + 3);
    icon.lineBetween(middle, y + 3, left, y + 3);
    icon.lineBetween(left, y + 3, left, y - 3);

    if (muted) {
      icon.lineBetween(x + 7, y - 8, x + 12, y + 8);
      return;
    }

    icon.beginPath();
    icon.arc(x + 7, y, 4, -0.85, 0.85, false);
    icon.strokePath();

    icon.beginPath();
    icon.arc(x + 7, y, 7, -0.8, 0.8, false);
    icon.strokePath();
  };

  background.on("pointerdown", () => {
    muted = !muted;
    scene.sound.mute = muted;
    redrawIcon();
  });

  redrawIcon();

  return { background, icon };
}
