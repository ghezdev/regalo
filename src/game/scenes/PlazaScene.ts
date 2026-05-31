import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "../config";
import { characters } from "../data/characters";
import { dialogues } from "../data/dialogues";
import { musicTracks } from "../data/music";
import { plazaMap } from "../data/maps/plaza";
import { createAudioToggle } from "../systems/audio";
import {
  renderGround,
  renderFountain,
  renderBuilding,
  renderLamp,
  renderTree,
  renderFlowerBed,
  renderBench,
  renderMailbox,
  LIGHT_DEPTH,
  OVERLAY_DEPTH,
  UI_DEPTH,
} from "../systems/decor";
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

    renderGround(this, plazaMap);
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
    this.player.setDepth(this.player.y);
    this.refreshInteractionState();
  }

  private renderDecor(collisionLayer: Phaser.Physics.Arcade.StaticGroup) {
    plazaMap.flowerBeds.forEach((p, i) => renderFlowerBed(this, p.x * TILE_SIZE, p.y * TILE_SIZE, i));
    plazaMap.trees.forEach((p) => renderTree(this, p.x * TILE_SIZE, p.y * TILE_SIZE));
    plazaMap.benches.forEach((p) => renderBench(this, p.x * TILE_SIZE, p.y * TILE_SIZE));
    plazaMap.lamps.forEach((p) => renderLamp(this, p.x * TILE_SIZE, p.y * TILE_SIZE));

    plazaMap.objects.forEach((object) => {
      const worldX = object.x * TILE_SIZE;
      const worldY = object.y * TILE_SIZE;
      const width = object.width * TILE_SIZE;
      const height = object.height * TILE_SIZE;

      if (object.kind === "fountain") {
        renderFountain(this, worldX, worldY, width, height);
      }

      if (object.kind === "building") {
        renderBuilding(this, worldX, worldY, width, height, object.variant, object.label);
      }

      if (object.kind === "mailbox") {
        renderMailbox(this, worldX, worldY, width, height);
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
      .setOffset(2, 12);

    this.player.setDepth(this.player.y);
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
    vignette.setScrollFactor(0).setDepth(OVERLAY_DEPTH);
    vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);

    // firefly dot texture
    const dot = this.add.graphics();
    dot.fillStyle(0xfff0b0, 1).fillCircle(2, 2, 2);
    dot.generateTexture("firefly", 4, 4);
    dot.destroy();

    const emitter = this.add.particles(0, 0, "firefly", {
      x: { min: 0, max: plazaMap.width * TILE_SIZE },
      y: { min: 0, max: plazaMap.height * TILE_SIZE },
      lifespan: 4000,
      speedY: { min: -6, max: 6 },
      speedX: { min: -6, max: 6 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      frequency: 600,
      quantity: 1,
      blendMode: Phaser.BlendModes.ADD,
    });
    emitter.setDepth(LIGHT_DEPTH);
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
      .setDepth(UI_DEPTH);
  }
}
