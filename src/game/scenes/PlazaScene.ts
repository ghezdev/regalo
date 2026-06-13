import * as Phaser from "phaser";
import { dialogues } from "../data/dialogues";
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, WORLD_WIDTH, WORLD_HEIGHT } from "../config";
import { plazaMap } from "../data/maps/plaza";
import { createAudioToggle } from "../systems/audio";
import { DialogueController } from "../systems/dialogue";
import { createInteractionPrompt, type ActiveInteraction } from "../systems/interactions";
import { createMovementKeys, resolveMovement, type MovementKeys } from "../systems/movement";
import type { GameSession } from "../types/game";

const UI_DEPTH = 100;

interface PlazaSceneData {
  session: GameSession;
}

export class PlazaScene extends Phaser.Scene {
  private session!: GameSession;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: MovementKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private floorKey!: Phaser.Input.Keyboard.Key;
  private dialogue!: DialogueController;
  private interactions: ActiveInteraction[] = [];
  private activeInteraction: ActiveInteraction | null = null;
  private guilleFloorActive = false;

  constructor() {
    super("plaza");
  }

  init(data: PlazaSceneData) {
    this.session = data.session;
  }

  create() {
    // ── World ──────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // ── Background ────────────────────────────────────────────────
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, "plaza-bg").setDepth(0);

    // ── Input ─────────────────────────────────────────────────────
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.movementKeys = createMovementKeys(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.floorKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // ── Collision walls ───────────────────────────────────────────
    const walls = this.physics.add.staticGroup();
    for (const c of plazaMap.colliders) {
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

    // ── Player ────────────────────────────────────────────────────
    const spawn = plazaMap.spawn[this.session.characterId];
    const textureKey = `character-${this.session.characterId}`;

    this.player = this.physics.add
      .sprite(spawn.x, spawn.y, textureKey, 0)
      .setSize(30, 20)
      .setOffset(10, 28)
      .setDepth(1);

    this.player.setCollideWorldBounds(true);
    this.player.setData("lastDirection", "down");
    this.physics.add.collider(this.player, walls);

    // ── Systems ───────────────────────────────────────────────────
    this.dialogue = new DialogueController(this);
    createAudioToggle(this);

    this.interactions = plazaMap.interactions.map((zone) =>
      createInteractionPrompt(this, zone, 1),
    );

    // ── Camera ────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.0);
    this.cameras.main.setRoundPixels(true);

    // ── HUD ───────────────────────────────────────────────────────
    this.add
      .text(12, 10, `${this.session.displayName} en la plaza`, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f6f3ff",
      })
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);

    this.add
      .text(12, 24, "Mover: WASD/Flechas  Interactuar: E  Tirar: F", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#d4caef",
      })
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);
  }

  update() {
    // ── Interact / advance dialogue ────────────────────────────────
    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.enterKey)
    ) {
      if (this.dialogue.isVisible()) {
        this.dialogue.advance();
        return;
      }
      if (this.activeInteraction) {
        const entry = dialogues[this.activeInteraction.data.interactionId];
        if (entry) {
          this.dialogue.show(this.activeInteraction.data.targetName, entry.lines);
        }
      }
    }

    // ── Guille floor toggle ────────────────────────────────────────
    if (
      Phaser.Input.Keyboard.JustDown(this.floorKey) &&
      this.session.characterId === "guillermo"
    ) {
      this.guilleFloorActive = !this.guilleFloorActive;
      if (this.guilleFloorActive) {
        this.player.setTexture("guille-piso");
        this.player.anims.stop();
        this.player.setVelocity(0, 0);
      } else {
        this.player.setTexture("character-guillermo");
      }
    }

    // ── Block input while floor mode or dialogue active ────────────
    if (this.dialogue.isVisible() || this.guilleFloorActive) {
      this.player.setVelocity(0, 0);
      if (!this.guilleFloorActive) this.player.anims.stop();
      return;
    }

    // ── Movement ──────────────────────────────────────────────────
    resolveMovement(this.player, this.movementKeys, this.cursorKeys);
    this.refreshInteractionState();
  }

  private refreshInteractionState() {
    let next: ActiveInteraction | null = null;
    for (const interaction of this.interactions) {
      const overlaps = this.physics.overlap(this.player, interaction.zone);
      interaction.prompt.setVisible(overlaps && !this.dialogue.isVisible());
      if (overlaps) next = interaction;
    }
    this.activeInteraction = next;
  }
}
