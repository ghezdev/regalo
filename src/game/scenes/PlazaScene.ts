import * as Phaser from "phaser";
import { dialogues } from "../data/dialogues";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../config";
import { plazaUi } from "../data/ui";
import { plazaMap } from "../data/maps/plaza";
import { PLAZA_INTERIOR_SPAWN } from "../data/maps/plaza-interiors";
import { createAudioToggle, pauseAmbientMusic, playAmbientMusic } from "../systems/audio";
import { DialogueController } from "../systems/dialogue";
import { markNaomiBadEndingSeen } from "../systems/ending/state";
import { loadNaomiStoryState, saveNaomiStoryState } from "../systems/story/state";
import { markEndingChoice, completeStep } from "../systems/story/progression";
import { createInteractionPrompt, type ActiveInteraction } from "../systems/interactions";
import { createMovementKeys, resolveMovement, type MovementKeys } from "../systems/movement";
import type { GameSession, Direction, PlayerUpdate } from "../types/game";
import type { MultiplayerClient } from "../systems/multiplayer";
import { setEndingBlackoutVisible, setOverlayHud, setOverlayLabels } from "../ui-overlay-store";

interface PlazaSceneData {
  session: GameSession;
  fromInterior?: string;
}

export class PlazaScene extends Phaser.Scene {
  private session!: GameSession;
  private fromInterior: string | undefined;
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
  private multiplayer!: MultiplayerClient;
  private remotePlayer: Phaser.GameObjects.Sprite | null = null;
  private lastRemoteUpdate: PlayerUpdate | null = null;
  private naomiBadEndingActive = false;
  private campStayZone: Phaser.GameObjects.Zone | null = null;
  private campLeaveZone: Phaser.GameObjects.Zone | null = null;
  private campApproachZone: Phaser.GameObjects.Zone | null = null;
  private preSalidaZone: Phaser.GameObjects.Zone | null = null;
  private campChoiceActive = false;
  private preSalidaSeen = false;

  private static readonly INTERIOR_MAP: Record<string, string> = {
    "castle-entrance": "castillo",
    "entrada-izq": "casa-pensamientos",
    "discoteca": "discoteca",
    "entrada-der": "cine",
    "zona-sur-der": "casa",
  };

  constructor() {
    super("plaza");
  }

  init(data: PlazaSceneData) {
    this.session = data.session;
    this.fromInterior = data.fromInterior;
  }

  create() {
    // Reset per-session state (scene instance is reused across restarts)
    this.remotePlayer?.destroy();
    this.remotePlayer = null;
    this.lastRemoteUpdate = null;
    this.guilleFloorActive = false;
    this.activeInteraction = null;
    this.naomiBadEndingActive = false;
    this.campChoiceActive = false;
    this.preSalidaSeen = false;
    this.campStayZone = null;
    this.campLeaveZone = null;
    this.campApproachZone = null;
    this.preSalidaZone = null;
    setEndingBlackoutVisible(false);

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
    const defaultSpawn = plazaMap.spawn[this.session.characterId];
    const spawn =
      (this.fromInterior && PLAZA_INTERIOR_SPAWN[this.fromInterior]) ?? defaultSpawn;
    if (!spawn || typeof spawn === "string") {
      throw new Error(`Invalid spawn for character ${this.session.characterId}`);
    }
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
    this.dialogue = new DialogueController();
    createAudioToggle(this);

    // Ambient music: play immediately if audio is already unlocked (e.g. coming from an interior),
    // otherwise wait for first user interaction (browser autoplay policy).
    if (!this.sound.locked) {
      playAmbientMusic(this);
    } else {
      this.input.once("pointerdown", () => {
        if (this.sound.locked) {
          this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
            playAmbientMusic(this);
          });
        } else {
          playAmbientMusic(this);
        }
      });
    }

    this.interactions = plazaMap.interactions.map((zone) => createInteractionPrompt(this, zone, 1));
    setOverlayHud({ movementHint: plazaUi.movementHint });

    // ── Naomi story camp zones ─────────────────────────────────────
    if (this.session.characterId === "naomi" && plazaMap.storyZones) {
      const sz = plazaMap.storyZones;
      this.preSalidaZone = this.add.zone(
        sz.preSalida.x + sz.preSalida.width / 2,
        sz.preSalida.y + sz.preSalida.height / 2,
        sz.preSalida.width,
        sz.preSalida.height,
      );
      this.physics.add.existing(this.preSalidaZone, true);
      this.campApproachZone = this.add.zone(
        sz.campApproach.x + sz.campApproach.width / 2,
        sz.campApproach.y + sz.campApproach.height / 2,
        sz.campApproach.width,
        sz.campApproach.height,
      );
      this.physics.add.existing(this.campApproachZone, true);
      this.campStayZone = this.add.zone(
        sz.campStay.x + sz.campStay.width / 2,
        sz.campStay.y + sz.campStay.height / 2,
        sz.campStay.width,
        sz.campStay.height,
      );
      this.physics.add.existing(this.campStayZone, true);
      this.campLeaveZone = this.add.zone(
        sz.campLeave.x + sz.campLeave.width / 2,
        sz.campLeave.y + sz.campLeave.height / 2,
        sz.campLeave.width,
        sz.campLeave.height,
      );
      this.physics.add.existing(this.campLeaveZone, true);
    }

    // ── Camera ────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.0);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── Multiplayer ───────────────────────────────────────────────
    this.multiplayer = this.registry.get("multiplayer") as MultiplayerClient;
    this.multiplayer.setScene("plaza");
    this.multiplayer.onUpdate((update) => {
      this.lastRemoteUpdate = update;
    });
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
        const interiorId = PlazaScene.INTERIOR_MAP[this.activeInteraction.data.interactionId];
        if (interiorId) {
          this.triggerEnterInterior(interiorId);
          return;
        }
        const entry = dialogues[this.activeInteraction.data.interactionId];
        if (entry) {
          const shouldTriggerNaomiBadEnding =
            this.session.characterId === "naomi" &&
            this.activeInteraction.data.interactionId === "fondo-sur";

          this.dialogue.show(this.activeInteraction.data.targetName, entry.lines, {
            onComplete: shouldTriggerNaomiBadEnding
              ? () => {
                  markNaomiBadEndingSeen();
                  pauseAmbientMusic();
                  this.naomiBadEndingActive = true;
                  setEndingBlackoutVisible(true);
                }
              : undefined,
          });
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

    // ── Naomi pre-salida warning ───────────────────────────────────
    if (
      this.session.characterId === "naomi" &&
      !this.preSalidaSeen &&
      this.preSalidaZone &&
      this.physics.overlap(this.player, this.preSalidaZone)
    ) {
      this.preSalidaSeen = true;
      this.dialogue.show("", dialogues["pre-salida"].lines, { hint: "presiona e para continuar" });
    }

    // ── Naomi story camp approach & choice ────────────────────────
    if (this.session.characterId === "naomi" && !this.campChoiceActive) {
      const storyState = loadNaomiStoryState();

      if (storyState.stepId === "camp-approach" && this.campApproachZone) {
        if (this.physics.overlap(this.player, this.campApproachZone)) {
          const next = completeStep(storyState, "camp-approach");
          saveNaomiStoryState(next);
          this.campChoiceActive = true;
          this.dialogue.show("", [
            "Aquí está Guille.",
            "Si querés quedarte con él, ve hacia la izquierda.",
            "Si querés seguir tu camino, ve hacia la derecha.",
          ], { hint: "presiona e para continuar" });
        }
      }

      if (storyState.stepId === "camp-choice") {
        if (this.campStayZone && this.physics.overlap(this.player, this.campStayZone)) {
          const next = markEndingChoice(storyState, "stay");
          saveNaomiStoryState(next);
          this.naomiBadEndingActive = true;
          pauseAmbientMusic();
          setEndingBlackoutVisible(true);
        } else if (this.campLeaveZone && this.physics.overlap(this.player, this.campLeaveZone)) {
          const next = markEndingChoice(storyState, "leave");
          saveNaomiStoryState(next);
          markNaomiBadEndingSeen();
          pauseAmbientMusic();
          this.naomiBadEndingActive = true;
          setEndingBlackoutVisible(true);
        }
      }
    }

    // ── Block input while floor mode or dialogue active ────────────
    if (this.naomiBadEndingActive) {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.refreshInteractionState(true);
      return;
    }

    if (this.dialogue.isVisible() || this.guilleFloorActive) {
      this.player.setVelocity(0, 0);
      if (!this.guilleFloorActive) this.player.anims.stop();
      this.refreshInteractionState(true);
    } else {
      // ── Movement ────────────────────────────────────────────────
      resolveMovement(this.player, this.movementKeys, this.cursorKeys);
      this.refreshInteractionState();
    }

    // ── Multiplayer: send own position (always) ───────────────────
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moving = body.velocity.lengthSq() > 0;
    const direction = (this.player.getData("lastDirection") ?? "down") as Direction;
    this.multiplayer.sendPosition(
      this.player.x,
      this.player.y,
      direction,
      moving,
      {
        floorMode: this.guilleFloorActive,
        plazaPosition: {
          x: this.player.x,
          y: this.player.y,
        },
      },
    );

    // ── Multiplayer: render remote player (always) ────────────────
    if (this.lastRemoteUpdate) {
      this.updateRemotePlayer(this.lastRemoteUpdate);
    }
  }

  private refreshInteractionState(forceHide = false) {
    let next: ActiveInteraction | null = null;
    const camera = this.cameras.main;
    const zoom = camera.zoom;
    const labels = [];

    for (const interaction of this.interactions) {
      const overlaps = this.physics.overlap(this.player, interaction.zone);
      const screenX = (interaction.anchorX - camera.worldView.x) * zoom;
      const screenY = (interaction.anchorY - camera.worldView.y) * zoom;
      const visible =
        !forceHide &&
        !this.dialogue.isVisible() &&
        screenX >= 0 &&
        screenX <= camera.width &&
        screenY >= 0 &&
        screenY <= camera.height;

      labels.push({
        id: interaction.data.id,
        text: interaction.data.label,
        x: screenX,
        y: screenY,
        visible,
        active: overlaps,
      });

      if (overlaps) {
        next = interaction;
      }
    }

    this.activeInteraction = next;
    setOverlayLabels(labels);
  }

  private updateRemotePlayer(update: PlayerUpdate) {
    if (update.scene !== "plaza") {
      this.remotePlayer?.setVisible(false);
      return;
    }

    if (!this.remotePlayer) {
      const textureKey = `character-${update.characterId}`;
      this.remotePlayer = this.add
        .sprite(update.x, update.y, textureKey, 0)
        .setDepth(1)
        .setAlpha(0.85);
    }

    this.remotePlayer.setVisible(true);
    this.remotePlayer.setPosition(update.x, update.y);

    if (update.floorMode) {
      this.remotePlayer.setTexture("guille-piso");
      this.remotePlayer.anims.stop();
      return;
    }

    const expectedTexture = `character-${update.characterId}`;
    if (this.remotePlayer.texture.key !== expectedTexture) {
      this.remotePlayer.setTexture(expectedTexture);
    }

    if (update.moving) {
      this.remotePlayer.anims.play(
        `character-${update.characterId}-${update.direction}`,
        true,
      );
    } else {
      this.remotePlayer.anims.stop();
      const frameLookup: Record<Direction, number> = { down: 0, left: 4, right: 8, up: 12 };
      this.remotePlayer.setFrame(frameLookup[update.direction]);
    }
  }

  private triggerEnterInterior(interiorId: string) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("interior", { interiorId, session: this.session });
    });
  }
}
