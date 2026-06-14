import * as Phaser from "phaser";

export function startLunaWander(
  scene: Phaser.Scene,
  sprite: Phaser.Physics.Arcade.Sprite,
  zones: Array<{ x: number; y: number; width: number; height: number }>,
): Phaser.Time.TimerEvent {
  return scene.time.addEvent({
    delay: 1800,
    loop: true,
    callback: () => {
      if (!sprite.active) return;
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const targetX = zone.x + Math.random() * zone.width;
      const targetY = zone.y + Math.random() * zone.height;
      (scene.physics as Phaser.Physics.Arcade.ArcadePhysics).moveTo(sprite, targetX, targetY, 28);
    },
  });
}
