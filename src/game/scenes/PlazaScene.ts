import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "../config";
import { characters } from "../data/characters";
import { dialogues } from "../data/dialogues";
import { musicTracks } from "../data/music";
import { plazaMap } from "../data/maps/plaza";
import { createAudioToggle } from "../systems/audio";
import { DialogueController } from "../systems/dialogue";
import { createInteractionPrompt, type ActiveInteraction } from "../systems/interactions";
import { createMovementKeys, resolveMovement, type MovementKeys } from "../systems/movement";
import type { GameSession } from "../types/game";

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
  private dialogue!: DialogueController;
  private interactions: ActiveInteraction[] = [];
  private activeInteraction: ActiveInteraction | null = null;

  constructor() {
    super("plaza");
  }

  init(data: PlazaSceneData) {
    this.session = data.session;
  }

  create() {
    this.physics.world.setBounds(
      0,
      0,
      plazaMap.width * TILE_SIZE,
      plazaMap.height * TILE_SIZE,
    );

    this.cursorKeys = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.movementKeys = createMovementKeys(this);
    this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E) as Phaser.Input.Keyboard.Key;
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER) as Phaser.Input.Keyboard.Key;

    this.renderGround();
    const collisionLayer = this.physics.add.staticGroup();
    this.renderDecor(collisionLayer);
    this.createPlayer();
    this.physics.add.collider(this.player, collisionLayer);

    this.dialogue = new DialogueController(this);
    createAudioToggle(this);
    this.createInteractions();
    this.createHud();
    this.createCamera();
    this.startPlaceholderMusic();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.dialogue.isVisible()) {
        this.dialogue.advance();
        return;
      }

      if (this.activeInteraction) {
        const dialogue = dialogues[this.activeInteraction.data.interactionId];
        if (dialogue) {
          this.dialogue.show(this.activeInteraction.data.targetName, dialogue.lines);
        }
      }
    }

    if (this.dialogue.isVisible()) {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      return;
    }

    resolveMovement(this.player, this.movementKeys, this.cursorKeys);
    this.refreshInteractionState();
  }

  private renderGround() {
    const graphics = this.add.graphics();

    for (let y = 0; y < plazaMap.height; y += 1) {
      for (let x = 0; x < plazaMap.width; x += 1) {
        const isPath = plazaMap.paths.some((point) => point.x === x && point.y === y);
        const fillColor = isPath ? 0x8d869b : (x + y) % 3 === 0 ? 0x1d3f37 : 0x21453b;

        graphics.fillStyle(fillColor, 1);
        graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if (!isPath && (x + y) % 7 === 0) {
          graphics.fillStyle(0x2a5b46, 1);
          graphics.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, 2, 2);
        }
      }
    }

    plazaMap.paths.forEach((point) => {
      graphics.fillStyle(0xa7a0af, 0.7);
      graphics.fillRect(point.x * TILE_SIZE + 2, point.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    });

    graphics.generateTexture("plaza-ground", plazaMap.width * TILE_SIZE, plazaMap.height * TILE_SIZE);
    graphics.destroy();

    this.add.image(0, 0, "plaza-ground").setOrigin(0);
  }

  private renderDecor(collisionLayer: Phaser.Physics.Arcade.StaticGroup) {
    const decor = this.add.container(0, 0);

    plazaMap.flowerBeds.forEach((point, index) => {
      const palette = index % 3;
      const colors = [0xf0a6ca, 0xf6d5dc, 0xe75874];
      const flower = this.add.container(point.x * TILE_SIZE, point.y * TILE_SIZE);
      const patch = this.add.rectangle(8, 8, TILE_SIZE, TILE_SIZE, 0x21453b, 0);
      const stem = this.add.rectangle(8, 10, 2, 5, 0x2f8053);
      const bloom = this.add.rectangle(8, 6, 6, 6, colors[palette]);
      flower.add([patch, stem, bloom]);
      decor.add(flower);
    });

    plazaMap.trees.forEach((point) => {
      const trunk = this.add.rectangle(
        point.x * TILE_SIZE + 8,
        point.y * TILE_SIZE + 16,
        6,
        14,
        0x5a3b28,
      );
      const leaves = this.add.ellipse(
        point.x * TILE_SIZE + 8,
        point.y * TILE_SIZE + 10,
        22,
        18,
        0x30614e,
      );
      decor.add([leaves, trunk]);
    });

    plazaMap.benches.forEach((point) => {
      const bench = this.add.container(point.x * TILE_SIZE, point.y * TILE_SIZE);
      bench.add([
        this.add.rectangle(8, 9, 14, 4, 0x8a5b45),
        this.add.rectangle(5, 13, 2, 5, 0x594238),
        this.add.rectangle(11, 13, 2, 5, 0x594238),
      ]);
      decor.add(bench);
    });

    plazaMap.lamps.forEach((point) => {
      const lamp = this.add.container(point.x * TILE_SIZE, point.y * TILE_SIZE);
      lamp.add([
        this.add.rectangle(8, 11, 3, 14, 0x4f4d64),
        this.add.rectangle(8, 4, 8, 8, 0xffd46a),
      ]);
      const glow = this.add.circle(point.x * TILE_SIZE + 8, point.y * TILE_SIZE + 6, 18, 0xffd46a, 0.16);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      decor.add(glow);
      decor.add(lamp);
    });

    plazaMap.objects.forEach((object) => {
      const worldX = object.x * TILE_SIZE;
      const worldY = object.y * TILE_SIZE;
      const width = object.width * TILE_SIZE;
      const height = object.height * TILE_SIZE;

      if (object.kind === "fountain") {
        decor.add(this.add.ellipse(worldX + width / 2, worldY + height / 2, width, height, 0x7d8fd6));
        decor.add(this.add.ellipse(worldX + width / 2, worldY + height / 2, width - 10, height - 10, 0xa7c4ff));
        decor.add(this.add.rectangle(worldX + width / 2, worldY + height / 2, 6, 18, 0xe9f0ff));
        decor.add(this.add.circle(worldX + width / 2, worldY + height / 2 - 12, 5, 0xe9f0ff, 0.9));
      }

      if (object.kind === "building") {
        const wallColor =
          object.variant === "dance"
            ? 0xb85f77
            : object.variant === "photos"
              ? 0x7f6cb0
              : object.variant === "audio"
                ? 0x55779e
                : 0x9b7f69;
        const roofColor =
          object.variant === "home" ? 0x6b3555 : object.variant === "photos" ? 0x4a3765 : 0x6b3e4b;

        decor.add(this.add.rectangle(worldX + width / 2, worldY + height / 2, width, height, wallColor));
        decor.add(this.add.rectangle(worldX + width / 2, worldY + 6, width + 8, 12, roofColor));
        decor.add(this.add.rectangle(worldX + width / 2, worldY + height - 10, 12, 20, 0x4e342e));
        decor.add(this.add.rectangle(worldX + 16, worldY + 20, 10, 10, 0xffd46a, 0.8));
        decor.add(this.add.rectangle(worldX + width - 16, worldY + 20, 10, 10, 0xffd46a, 0.8));

        if (object.label) {
          decor.add(
            this.add
              .text(worldX + width / 2, worldY - 10, object.label, {
                fontFamily: "monospace",
                fontSize: "8px",
                color: "#f7d6e0",
              })
              .setOrigin(0.5),
          );
        }
      }

      if (object.kind === "mailbox") {
        decor.add(this.add.rectangle(worldX + width / 2, worldY + height / 2, 14, 16, 0xc76067));
        decor.add(this.add.rectangle(worldX + width / 2, worldY + 6, 10, 2, 0x3c2233));
        decor.add(this.add.rectangle(worldX + width / 2, worldY + 18, 4, 10, 0x5f4336));
      }

      if (object.solid) {
        const collider = this.add.rectangle(worldX + width / 2, worldY + height / 2, width, height, 0x000000, 0);
        this.physics.add.existing(collider, true);
        collisionLayer.add(collider);
      }
    });
  }

  private createPlayer() {
    const character = characters[this.session.characterId];
    const spawn = plazaMap.spawn[this.session.characterId];

    this.player = this.physics.add
      .sprite(spawn.x * TILE_SIZE + 8, spawn.y * TILE_SIZE + 8, character.textureKey, 0)
      .setSize(12, 8)
      .setOffset(2, 12)
      .setDepth(10);

    this.player.setCollideWorldBounds(true);
    this.player.setData("lastDirection", "down");
  }

  private createInteractions() {
    this.interactions = plazaMap.interactions.map((interaction) =>
      createInteractionPrompt(this, interaction, TILE_SIZE),
    );
  }

  private refreshInteractionState() {
    let nextInteraction: ActiveInteraction | null = null;

    this.interactions.forEach((interaction) => {
      const overlaps = this.physics.overlap(this.player, interaction.zone);
      interaction.prompt.setVisible(overlaps && !this.dialogue.isVisible());

      if (overlaps) {
        nextInteraction = interaction;
      }
    });

    this.activeInteraction = nextInteraction;
  }

  private createCamera() {
    this.cameras.main.setBounds(0, 0, plazaMap.width * TILE_SIZE, plazaMap.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setRoundPixels(true);

    const vignette = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x04050b,
      0.18,
    );
    vignette.setScrollFactor(0).setDepth(30);
    vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  private createHud() {
    this.add
      .text(12, 10, `${this.session.displayName} en la plaza`, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f6f3ff",
      })
      .setScrollFactor(0)
      .setDepth(40);

    this.add
      .text(12, 24, "Mover: WASD/Flechas  Interactuar: E", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#d4caef",
      })
      .setScrollFactor(0)
      .setDepth(40);
  }

  private startPlaceholderMusic() {
    const music = musicTracks.plazaNight;

    this.add
      .text(GAME_WIDTH - 12, GAME_HEIGHT - 84, `Audio: ${music.title} placeholder`, {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#c3b9d9",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(40);
  }
}
