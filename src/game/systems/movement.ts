import * as Phaser from "phaser";
import { PLAYER_SPEED } from "../config";

export interface MovementKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

export function createMovementKeys(scene: Phaser.Scene): MovementKeys {
  const cursors = scene.input.keyboard?.createCursorKeys();
  const wasd = scene.input.keyboard?.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;

  if (!cursors || !wasd.W || !wasd.A || !wasd.S || !wasd.D) {
    throw new Error("Keyboard input is required for the plaza scene.");
  }

  return {
    up: wasd.W,
    down: wasd.S,
    left: wasd.A,
    right: wasd.D,
  };
}

export function resolveMovement(
  sprite: Phaser.Physics.Arcade.Sprite,
  movementKeys: MovementKeys,
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys,
) {
  const left = movementKeys.left.isDown || cursorKeys.left.isDown;
  const right = movementKeys.right.isDown || cursorKeys.right.isDown;
  const up = movementKeys.up.isDown || cursorKeys.up.isDown;
  const down = movementKeys.down.isDown || cursorKeys.down.isDown;

  let velocityX = 0;
  let velocityY = 0;
  let animationDirection = "down";

  if (left) {
    velocityX = -PLAYER_SPEED;
    animationDirection = "left";
  } else if (right) {
    velocityX = PLAYER_SPEED;
    animationDirection = "right";
  }

  if (up) {
    velocityY = -PLAYER_SPEED;
    animationDirection = "up";
  } else if (down) {
    velocityY = PLAYER_SPEED;
    animationDirection = "down";
  }

  sprite.setVelocity(velocityX, velocityY);
  const body = sprite.body as Phaser.Physics.Arcade.Body | null;
  body?.velocity.normalize().scale(PLAYER_SPEED);

  if (velocityX === 0 && velocityY === 0) {
    sprite.anims.stop();
    const frameLookup: Record<string, number> = {
      down: 0,
      left: 4,
      right: 8,
      up: 12,
    };
    const currentAnim = sprite.getData("lastDirection") ?? "down";
    sprite.setFrame(frameLookup[currentAnim]);
    return;
  }

  sprite.setData("lastDirection", animationDirection);
  sprite.anims.play(`${sprite.texture.key}-${animationDirection}`, true);
}
