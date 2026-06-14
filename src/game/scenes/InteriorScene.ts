import * as Phaser from "phaser";
import type { GameSession, Direction, PlayerUpdate } from "../types/game";
import type { MultiplayerClient } from "../systems/multiplayer";
import { interiors } from "../data/maps/interiors";
import { plazaUi } from "../data/ui";
import { PLAZA_INTERIOR_SPAWN } from "../data/maps/plaza-interiors";
import { createMovementKeys, resolveMovement, type MovementKeys } from "../systems/movement";
import { setOverlayLabels, setOverlayHud, setAudioLabel, setDiscoAudioOpen, setCineVideoOpen } from "../ui-overlay-store";
import { createAudioToggle, pauseAmbientMusic, resumeAmbientMusic } from "../systems/audio";
import { ButtonAudioSystem } from "../systems/button-audio";
import { audioCalendar, getAudioForButton } from "../data/audio-calendar";
import type { AudioCalendarEntry } from "../types/content";
import { DialogueController } from "../systems/dialogue";
import { naomiIntroDialogue, dialogues } from "../data/dialogues";
import { hasSeenNaomiIntro, markNaomiIntroAsSeen, hasSeenExitDialogue, markExitDialogueAsSeen } from "../systems/intro/state";
import { loadNaomiStoryState, saveNaomiStoryState } from "../systems/story/state";
import { completeStep, INTERIOR_STORY_STEPS } from "../systems/story/progression";
import { startLunaWander } from "../systems/story/luna-wander";

interface InteriorSceneData {
  interiorId: string;
  session: GameSession;
  spawnOverride?: { x: number; y: number };
}

const INTERIOR_WALL_THICKNESS = 16;

function subtractIntervals(
  baseStart: number,
  baseEnd: number,
  cuts: Array<{ start: number; end: number }>,
) {
  let segments = [{ start: baseStart, end: baseEnd }];

  for (const cut of cuts) {
    const nextSegments = [];

    for (const segment of segments) {
      if (cut.end <= segment.start || cut.start >= segment.end) {
        nextSegments.push(segment);
        continue;
      }

      if (cut.start > segment.start) {
        nextSegments.push({ start: segment.start, end: cut.start });
      }

      if (cut.end < segment.end) {
        nextSegments.push({ start: cut.end, end: segment.end });
      }
    }

    segments = nextSegments;
  }

  return segments.filter((segment) => segment.end - segment.start > 0);
}

function buildWalkableBoundaryColliders(walkableZones: typeof interiors.castillo.walkableZones = []) {
  if (!walkableZones?.length) {
    return [];
  }

  const colliders: Array<{ x: number; y: number; width: number; height: number }> = [];

  for (const zone of walkableZones) {
    const x1 = zone.x;
    const x2 = zone.x + zone.width;
    const y1 = zone.y;
    const y2 = zone.y + zone.height;

    const touchingTop = walkableZones
      .filter((other) => other !== zone && other.y + other.height === y1)
      .map((other) => ({
        start: Math.max(x1, other.x),
        end: Math.min(x2, other.x + other.width),
      }))
      .filter((segment) => segment.end > segment.start);

    const touchingBottom = walkableZones
      .filter((other) => other !== zone && other.y === y2)
      .map((other) => ({
        start: Math.max(x1, other.x),
        end: Math.min(x2, other.x + other.width),
      }))
      .filter((segment) => segment.end > segment.start);

    const touchingLeft = walkableZones
      .filter((other) => other !== zone && other.x + other.width === x1)
      .map((other) => ({
        start: Math.max(y1, other.y),
        end: Math.min(y2, other.y + other.height),
      }))
      .filter((segment) => segment.end > segment.start);

    const touchingRight = walkableZones
      .filter((other) => other !== zone && other.x === x2)
      .map((other) => ({
        start: Math.max(y1, other.y),
        end: Math.min(y2, other.y + other.height),
      }))
      .filter((segment) => segment.end > segment.start);

    for (const segment of subtractIntervals(x1, x2, touchingTop)) {
      colliders.push({
        x: segment.start,
        y: y1 - INTERIOR_WALL_THICKNESS,
        width: segment.end - segment.start,
        height: INTERIOR_WALL_THICKNESS,
      });
    }

    for (const segment of subtractIntervals(x1, x2, touchingBottom)) {
      colliders.push({
        x: segment.start,
        y: y2,
        width: segment.end - segment.start,
        height: INTERIOR_WALL_THICKNESS,
      });
    }

    for (const segment of subtractIntervals(y1, y2, touchingLeft)) {
      colliders.push({
        x: x1 - INTERIOR_WALL_THICKNESS,
        y: segment.start,
        width: INTERIOR_WALL_THICKNESS,
        height: segment.end - segment.start,
      });
    }

    for (const segment of subtractIntervals(y1, y2, touchingRight)) {
      colliders.push({
        x: x2,
        y: segment.start,
        width: INTERIOR_WALL_THICKNESS,
        height: segment.end - segment.start,
      });
    }
  }

  return colliders;
}

export class InteriorScene extends Phaser.Scene {
  private session!: GameSession;
  private interiorId!: string;
  private spawnOverride: { x: number; y: number } | undefined;
  private interiorDef = interiors.castillo;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: MovementKeys;
  private exitZone!: Phaser.GameObjects.Zone;
  private buttonStates: Map<string, { zone: Phaser.GameObjects.Zone; sprite: Phaser.GameObjects.Sprite }> = new Map();
  private exiting = false;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private buttonAudio!: ButtonAudioSystem;
  private previousActiveButtonId: string | null = null;
  private multiplayer!: MultiplayerClient;
  private remotePlayer: Phaser.GameObjects.Sprite | null = null;
  private lastRemoteUpdate: PlayerUpdate | null = null;
  private dialogue!: DialogueController;
  private lunaSprite: Phaser.Physics.Arcade.Sprite | null = null;
  private lunaWanderTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("interior");
  }

  init(data: InteriorSceneData) {
    this.interiorId = data.interiorId;
    this.session = data.session;
    this.spawnOverride = data.spawnOverride;
  }

  preload() {
    for (const entry of audioCalendar) {
      this.load.audio(entry.key, entry.src);
    }
  }

  create() {
    const def = interiors[this.interiorId];
    if (!def) throw new Error(`Interior "${this.interiorId}" not found`);
    this.interiorDef = def;

    this.exiting = false;
    this.buttonStates.clear();
    this.previousActiveButtonId = null;
    this.lunaWanderTimer?.remove();
    this.lunaWanderTimer = null;
    this.lunaSprite?.destroy();
    this.lunaSprite = null;
    this.remotePlayer?.destroy();
    this.remotePlayer = null;
    this.lastRemoteUpdate = null;
    setOverlayLabels([]);
    setOverlayHud({ movementHint: plazaUi.movementHint });
    setAudioLabel(null);

    pauseAmbientMusic();

    if (this.interiorId === "discoteca") {
      setDiscoAudioOpen(true);
    }

    if (this.interiorId === "cine" && this.session.characterId === "naomi") {
      setCineVideoOpen(true);
    }

    // World
    this.physics.world.setBounds(0, 0, def.worldWidth, def.worldHeight);
    this.add.image(def.worldWidth / 2, def.worldHeight / 2, def.bgKey).setDepth(0);

    // Colliders
    const walls = this.physics.add.staticGroup();
    const wallColliders = [...def.colliders, ...buildWalkableBoundaryColliders(def.walkableZones)];

    for (const c of wallColliders) {
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

    // Player — spawn at override, story spawn, or exit zone center
    let storySpawnPos: { x: number; y: number } | undefined;
    if (this.session.characterId === "naomi" && def.storySpawns) {
      const storyState = loadNaomiStoryState();
      storySpawnPos = def.storySpawns[storyState.stepId];
    }
    const spawnX = this.spawnOverride?.x ?? storySpawnPos?.x ?? def.exitZone.x + def.exitZone.width / 2;
    const spawnY = this.spawnOverride?.y ?? storySpawnPos?.y ?? def.exitZone.y + def.exitZone.height / 2;
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

    const audioMap = new Map<string, AudioCalendarEntry>();
    for (const btn of def.buttons || []) {
      const entry = getAudioForButton(btn.id);
      if (entry) {
        audioMap.set(btn.id, entry);
      }
    }
    this.buttonAudio = new ButtonAudioSystem(this, audioMap);
    this.dialogue = new DialogueController();

    // Input
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.movementKeys = createMovementKeys(this);
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Camera
    this.cameras.main.setBounds(0, 0, def.worldWidth, def.worldHeight);
    if (def.staticCamera) {
      const zoom = Math.min(this.cameras.main.width / def.worldWidth, this.cameras.main.height / def.worldHeight);
      this.cameras.main.setZoom(zoom);
      this.cameras.main.centerOn(def.worldWidth / 2, def.worldHeight / 2);
    } else {
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }
    this.cameras.main.setRoundPixels(true);
    createAudioToggle(this);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    if (
      this.interiorId === "castillo" &&
      this.session.characterId === "naomi" &&
      !hasSeenNaomiIntro()
    ) {
      this.dialogue.show("Para Naomi", naomiIntroDialogue.lines, {
        hint: "presiona e para continuar",
        onComplete: () => {
          markNaomiIntroAsSeen();
        },
      });
    }

    if (this.interiorId === "discoteca" && this.session.characterId === "naomi") {
      const entry = dialogues["discoteca-intro"];
      this.dialogue.show("La Discoteca", entry.lines, { hint: "presiona e para continuar" });
    }

    if (this.interiorId === "casa" && this.session.characterId === "naomi") {
      const entry = dialogues["casa-intro"];
      this.dialogue.show("Nuestra Casa", entry.lines, { hint: "presiona e para continuar" });
    }

    if (this.interiorId === "casa-pensamientos" && this.session.characterId === "naomi") {
      const entry = dialogues["casa-pensamientos-intro"];
      this.dialogue.show("Mis Pensamientos", entry.lines, { hint: "presiona e para continuar" });
    }

    // ── Naomi story: advance intro step on entry ──────────────────
    if (this.session.characterId === "naomi") {
      const stepsForInterior = INTERIOR_STORY_STEPS[this.interiorId];
      if (stepsForInterior) {
        const storyState = loadNaomiStoryState();
        if (storyState.stepId === stepsForInterior.intro) {
          const next = completeStep(storyState, stepsForInterior.intro);
          saveNaomiStoryState(next);
        }
      }
    }

    // ── Luna wandering in casa ────────────────────────────────────
    if (this.interiorId === "casa" && this.session.characterId === "naomi" && def.lunaRoamZones?.length) {
      const textureKey = `character-naomi`;
      this.lunaSprite = this.physics.add
        .sprite(def.lunaRoamZones[0].x + 50, def.lunaRoamZones[0].y + 50, textureKey, 4)
        .setDepth(2)
        .setAlpha(0.7)
        .setSize(30, 20)
        .setOffset(10, 28);
      this.lunaWanderTimer = startLunaWander(this, this.lunaSprite, def.lunaRoamZones);
    }

    // ── Multiplayer ───────────────────────────────────────────────
    this.multiplayer = this.registry.get("multiplayer") as MultiplayerClient;
    this.multiplayer.setScene(`interior:${this.interiorId}`);
    this.multiplayer.onUpdate((update) => {
      this.lastRemoteUpdate = update;
    });

    this.events.on("shutdown", () => {
      setDiscoAudioOpen(false);
      setCineVideoOpen(false);
      resumeAmbientMusic();
    });
  }

  update() {
    if (this.exiting) return;

    if (this.dialogue.isVisible()) {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.dialogue.advance();
      }

      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      setOverlayLabels([]);
      return;
    }

    resolveMovement(this.player, this.movementKeys, this.cursorKeys);

    const atExit = this.physics.overlap(this.player, this.exitZone);

    if (atExit && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const exitDialogueId = `${this.interiorId}-exit`;
      const exitDialogue = dialogues[exitDialogueId];
      if (
        exitDialogue &&
        this.session.characterId === "naomi" &&
        !hasSeenExitDialogue(this.interiorId)
      ) {
        markExitDialogueAsSeen(this.interiorId);
        this.dialogue.show("", exitDialogue.lines, {
          hint: "presiona e para continuar",
          onComplete: () => {
            this.triggerExit();
          },
        });
      } else {
        this.triggerExit();
      }
      return;
    }

    this.refreshExitLabel(atExit);

    let activeButtonId: string | null = null;

    for (const [id, { zone, sprite }] of this.buttonStates) {
      const isOverlapping = this.physics.overlap(this.player, zone);

      if (isOverlapping) {
        activeButtonId = id;
        sprite.setTexture("tecla-presionada");
      } else {
        sprite.setTexture("tecla");
      }
    }

    if (activeButtonId !== this.previousActiveButtonId) {
      if (this.previousActiveButtonId) {
        this.buttonAudio.onButtonLeave(this.previousActiveButtonId);
        setAudioLabel(null);
      }

      if (activeButtonId) {
        this.buttonAudio.onButtonEnter(activeButtonId);
      }

      this.previousActiveButtonId = activeButtonId;
    }

    if (activeButtonId) {
      const entry = getAudioForButton(activeButtonId);
      if (entry) {
        const { zone } = this.buttonStates.get(activeButtonId)!;
        const camera = this.cameras.main;
        const zoom = camera.zoom;
        const wx = zone.x;
        const wy = zone.y - zone.height / 2 - 16;
        const screenX = (wx - camera.worldView.x) * zoom;
        const screenY = (wy - camera.worldView.y) * zoom;
        const { elapsed, duration } = this.buttonAudio.getProgress();
        setAudioLabel({ text: entry.dateLabel, x: screenX, y: screenY, elapsed, duration });
      }
    }

    // ── Multiplayer: send own position ────────────────────────────
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moving = body.velocity.lengthSq() > 0;
    const direction = (this.player.getData("lastDirection") ?? "down") as Direction;
    this.multiplayer.sendPosition(this.player.x, this.player.y, direction, moving, {
      plazaPosition: PLAZA_INTERIOR_SPAWN[this.interiorId],
    });

    // ── Multiplayer: render remote player ─────────────────────────
    if (this.lastRemoteUpdate) {
      this.updateRemotePlayer(this.lastRemoteUpdate);
    }
  }

  private updateRemotePlayer(update: PlayerUpdate) {
    const expectedScene = `interior:${this.interiorId}`;
    if (update.scene !== expectedScene) {
      this.remotePlayer?.setVisible(false);
      return;
    }

    if (!this.remotePlayer) {
      const textureKey = `character-${update.characterId}`;
      this.remotePlayer = this.add
        .sprite(update.x, update.y, textureKey, 0)
        .setDepth(2)
        .setAlpha(0.85);
    }

    this.remotePlayer.setVisible(true);
    this.remotePlayer.setPosition(update.x, update.y);

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

  private refreshExitLabel(active: boolean) {
    const camera = this.cameras.main;
    const zoom = camera.zoom;
    const wx = this.exitZone.x;
    const wy = this.exitZone.y - this.exitZone.height / 2 - 16;
    const screenX = (wx - camera.worldView.x) * zoom;
    const screenY = (wy - camera.worldView.y) * zoom;
    const inView =
      screenX >= 0 && screenX <= camera.width &&
      screenY >= 0 && screenY <= camera.height;

    setOverlayLabels([
      { id: "exit", text: "Salida", x: screenX, y: screenY, visible: inView, active },
    ]);
  }

  private triggerExit() {
    this.exiting = true;
    this.buttonAudio.destroy();
    this.lunaWanderTimer?.remove();
    setAudioLabel(null);
    setDiscoAudioOpen(false);
    setCineVideoOpen(false);
    resumeAmbientMusic();

    if (this.session.characterId === "naomi") {
      const stepsForInterior = INTERIOR_STORY_STEPS[this.interiorId];
      if (stepsForInterior) {
        const storyState = loadNaomiStoryState();
        if (storyState.stepId === stepsForInterior.exit) {
          const next = completeStep(storyState, stepsForInterior.exit);
          saveNaomiStoryState(next);
        }
      }
    }

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("plaza", { session: this.session, fromInterior: this.interiorId });
    });
  }
}
