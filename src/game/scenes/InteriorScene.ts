import * as Phaser from "phaser";
import type { GameSession } from "../types/game";
import { interiors } from "../data/maps/interiors";
import { createMovementKeys, resolveMovement, type MovementKeys } from "../systems/movement";

interface InteriorSceneData {
  interiorId: string;
  session: GameSession;
}

export class InteriorScene extends Phaser.Scene {
  private session!: GameSession;
  private interiorId!: string;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: MovementKeys;
  private exitZone!: Phaser.GameObjects.Zone;
  private buttonStates: Map<string, { zone: Phaser.GameObjects.Zone; sprite: Phaser.GameObjects.Sprite }> = new Map();
  private exiting = false;
  private enterCooldown = true;

  constructor() {
    super("interior");
  }

  init(data: InteriorSceneData) {
    this.interiorId = data.interiorId;
    this.session = data.session;
  }

  create() {
    const def = interiors[this.interiorId];
    if (!def) throw new Error(`Interior "${this.interiorId}" not found`);

    this.exiting = false;
    this.enterCooldown = true;
    this.buttonStates.clear();

    // World
    this.physics.world.setBounds(0, 0, def.worldWidth, def.worldHeight);
    this.add.image(def.worldWidth / 2, def.worldHeight / 2, def.bgKey).setDepth(0);

    // Colliders
    const walls = this.physics.add.staticGroup();
    for (const c of def.colliders) {
      const rect = this.add.rectangle(
        c.x + c.width / 2,
        c.y + c.height / 2,
        c.width,
        c.height,
        0x000000,
        0,
      );
      this.physics.add.existing(rect, true);
      walls.add(rect);
    }

    // Exit zone
    this.exitZone = this.add.zone(
      def.exitZone.x + def.exitZone.width / 2,
      def.exitZone.y + def.exitZone.height / 2,
      def.exitZone.width,
      def.exitZone.height,
    );
    this.physics.add.existing(this.exitZone, true);

    // Player — spawn at exit zone center
    const spawnX = def.exitZone.x + def.exitZone.width / 2;
    const spawnY = def.exitZone.y + def.exitZone.height / 2;
    const textureKey = `character-${this.session.characterId}`;
    this.player = this.physics.add
      .sprite(spawnX, spawnY, textureKey, 0)
      .setSize(30, 20)
      .setOffset(10, 28)
      .setDepth(2);
    this.player.setCollideWorldBounds(true);
    this.player.setData("lastDirection", "down");
    this.physics.add.collider(this.player, walls);

    // Buttons (optional)
    if (def.buttons) {
      for (const btn of def.buttons) {
        const cx = btn.x + btn.width / 2;
        const cy = btn.y + btn.height / 2;
        const sprite = this.add.sprite(cx, cy, "tecla").setDepth(1);
        const zone = this.add.zone(cx, cy, btn.width, btn.height);
        this.physics.add.existing(zone, true);
        this.buttonStates.set(btn.id, { zone, sprite });
      }
    }

    // Input
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.movementKeys = createMovementKeys(this);

    // Camera
    this.cameras.main.setBounds(0, 0, def.worldWidth, def.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Grace period: ignora la exitZone durante 500ms para no salir inmediatamente al entrar
    this.time.delayedCall(500, () => {
      this.enterCooldown = false;
    });
  }

  update() {
    if (this.exiting) return;

    resolveMovement(this.player, this.movementKeys, this.cursorKeys);

    if (!this.enterCooldown && this.physics.overlap(this.player, this.exitZone)) {
      this.triggerExit();
    }

    for (const [id, { zone, sprite }] of this.buttonStates) {
      if (this.physics.overlap(this.player, zone)) {
        sprite.setTexture("tecla-presionada");
        console.log(`botón ${id} presionado`);
      } else {
        sprite.setTexture("tecla");
      }
    }
  }

  private triggerExit() {
    this.exiting = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("plaza", { session: this.session });
    });
  }
}
