import * as Phaser from "phaser";

export function createAudioToggle(scene: Phaser.Scene) {
  const background = scene.add
    .rectangle(scene.scale.width - 30, 18, 48, 20, 0x12172c, 0.92)
    .setStrokeStyle(1, 0xe9d7a1)
    .setScrollFactor(0)
    .setDepth(40)
    .setInteractive({ useHandCursor: true });

  const label = scene.add
    .text(scene.scale.width - 30, 18, "MUTE", {
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#f6f3ff",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(41);

  const syncLabel = () => {
    label.setText(scene.sound.mute ? "SOUND" : "MUTE");
  };

  background.on("pointerdown", () => {
    scene.sound.mute = !scene.sound.mute;
    syncLabel();
  });

  syncLabel();
  return { background, label };
}
