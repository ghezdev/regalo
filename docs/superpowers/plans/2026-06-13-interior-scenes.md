# Interior Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al presionar E en una zona de entrada de la plaza, la escena hace fade a negro y carga el interior correspondiente; el jugador puede moverse por el interior, colisionar con las paredes, presionar botones (Casa de los pensamientos), y volver a la plaza pisando la zona de salida amarilla.

**Architecture:** Una única clase `InteriorScene` genérica recibe el `interiorId` como dato y lee su configuración desde `interiors.ts` (colliders, zona de salida, botones opcionales). La PlazaScene hace `camera.fadeOut` → `scene.start("interior", ...)` al presionar E sobre una entrada; `InteriorScene` hace `camera.fadeIn` al montar y `fadeOut` → `scene.start("plaza", ...)` al pisar la zona de salida.

**Tech Stack:** Phaser 3, TypeScript, Next.js (assets servidos desde `/public/sprites/`)

---

## File Map

| Acción | Archivo |
|---|---|
| Crear | `src/game/scenes/InteriorScene.ts` |
| Crear | `src/game/data/maps/interiors.ts` |
| Modificar | `src/game/types/content.ts` — agregar `InteriorDefinition`, `ButtonDefinition` |
| Modificar | `src/game/scenes/BootScene.ts` — preload de fondos interiores y botones |
| Modificar | `src/game/main.ts` — registrar `InteriorScene` |
| Modificar | `src/game/scenes/PlazaScene.ts` — fade + scene switch al interactuar con entradas |

---

## Task 1: Agregar tipos a content.ts

**Files:**
- Modify: `src/game/types/content.ts`

- [ ] **Agregar las interfaces al final de `src/game/types/content.ts`:**

```ts
export interface ButtonDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColliderRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteriorDefinition {
  id: string;
  bgKey: string;
  worldWidth: number;
  worldHeight: number;
  colliders: ColliderRect[];
  exitZone: ColliderRect;
  buttons?: ButtonDefinition[];
}
```

- [ ] **Verificar tipos:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Commit:**

```bash
git add src/game/types/content.ts
git commit -m "feat(types): add InteriorDefinition and ButtonDefinition"
```

---

## Task 2: Crear archivo de datos de interiores

**Files:**
- Create: `src/game/data/maps/interiors.ts`

Los colliders empiezan vacíos (`[]`) y se rellenan en la Task 6 (visual). Las `exitZone` son estimaciones que se ajustan en Task 7 con physics debug.

- [ ] **Crear `src/game/data/maps/interiors.ts`:**

```ts
import type { InteriorDefinition } from "../../types/content";

export const interiors: Record<string, InteriorDefinition> = {
  castillo: {
    id: "castillo",
    bgKey: "bg-castillo",
    worldWidth: 1916,
    worldHeight: 821,
    colliders: [],
    // Ajustar con physics debug (Task 7): buscar la línea amarilla en castillo limites.webp
    exitZone: { x: 808, y: 720, width: 300, height: 40 },
  },

  "casa-pensamientos": {
    id: "casa-pensamientos",
    bgKey: "bg-casa-pensamientos",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    // Ajustar con physics debug (Task 7): buscar la línea amarilla en casa de los recuerdos limites y botones.webp
    exitZone: { x: 524, y: 960, width: 400, height: 40 },
    // Ajustar con physics debug (Task 7): buscar las posiciones de los botones en el mismo archivo
    buttons: [],
  },

  discoteca: {
    id: "discoteca",
    bgKey: "bg-discoteca",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    // Ajustar con physics debug (Task 7): buscar la línea amarilla en discoteca limites.webp
    exitZone: { x: 524, y: 960, width: 400, height: 40 },
  },

  casa: {
    id: "casa",
    bgKey: "bg-casa",
    worldWidth: 1950,
    worldHeight: 1300,
    colliders: [],
    // Ajustar con physics debug (Task 7): buscar la línea amarilla en casa limites.webp
    exitZone: { x: 775, y: 1160, width: 400, height: 40 },
  },
};
```

- [ ] **Verificar tipos:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Commit:**

```bash
git add src/game/data/maps/interiors.ts
git commit -m "feat(data): add interior scene definitions with placeholder zones"
```

---

## Task 3: Preload de assets en BootScene

**Files:**
- Modify: `src/game/scenes/BootScene.ts`

- [ ] **Agregar al método `preload()` de BootScene, después de la línea `"guille-piso"`:**

```ts
// Interior backgrounds
this.load.image("bg-castillo", "/sprites/interiores/castillo.png");
this.load.image("bg-casa-pensamientos", "/sprites/interiores/casa%20de%20los%20recuerdos.png");
this.load.image("bg-discoteca", "/sprites/interiores/discoteca.png");
this.load.image("bg-casa", "/sprites/interiores/casa.jpg");

// Button sprites
this.load.image("tecla", "/sprites/botones/tecla.png");
this.load.image("tecla-presionada", "/sprites/botones/tecla_presionada.webp");
```

- [ ] **Verificar tipos:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

- [ ] **Commit:**

```bash
git add src/game/scenes/BootScene.ts
git commit -m "feat(boot): preload interior backgrounds and button sprites"
```

---

## Task 4: Implementar InteriorScene

**Files:**
- Create: `src/game/scenes/InteriorScene.ts`

- [ ] **Crear `src/game/scenes/InteriorScene.ts`:**

```ts
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
```

- [ ] **Verificar tipos:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Commit:**

```bash
git add src/game/scenes/InteriorScene.ts
git commit -m "feat(scene): implement generic InteriorScene with fade, colliders, exit, and buttons"
```

---

## Task 5: Registrar InteriorScene en main.ts

**Files:**
- Modify: `src/game/main.ts`

- [ ] **Agregar el import al principio de `src/game/main.ts`:**

```ts
import { InteriorScene } from "./scenes/InteriorScene";
```

- [ ] **Agregar `InteriorScene` al array `scene` en la config de Phaser:**

Cambiar:
```ts
scene: [BootScene, PlazaScene],
```
Por:
```ts
scene: [BootScene, PlazaScene, InteriorScene],
```

- [ ] **Verificar tipos:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

- [ ] **Commit:**

```bash
git add src/game/main.ts
git commit -m "feat(game): register InteriorScene"
```

---

## Task 6: Actualizar PlazaScene para transicionar a interiores

**Files:**
- Modify: `src/game/scenes/PlazaScene.ts`

- [ ] **Agregar el mapa de interacción→interior como propiedad estática, justo antes del `constructor`:**

```ts
private static readonly INTERIOR_MAP: Record<string, string> = {
  "castle-entrance": "castillo",
  "entrada-izq": "casa-pensamientos",
  "discoteca": "discoteca",
  "zona-sur-der": "casa",
};
```

- [ ] **Agregar el método `triggerEnterInterior` al final de la clase (antes del `}`)**:

```ts
private triggerEnterInterior(interiorId: string) {
  this.cameras.main.fadeOut(300, 0, 0, 0);
  this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    this.scene.start("interior", { interiorId, session: this.session });
  });
}
```

- [ ] **En el método `update()`, reemplazar el bloque `if (this.activeInteraction)` dentro del handler de E/Enter:**

Antes:
```ts
if (this.activeInteraction) {
  const entry = dialogues[this.activeInteraction.data.interactionId];
  if (entry) {
    this.dialogue.show(this.activeInteraction.data.targetName, entry.lines);
  }
}
```

Después:
```ts
if (this.activeInteraction) {
  const interiorId = PlazaScene.INTERIOR_MAP[this.activeInteraction.data.interactionId];
  if (interiorId) {
    this.triggerEnterInterior(interiorId);
    return;
  }
  const entry = dialogues[this.activeInteraction.data.interactionId];
  if (entry) {
    this.dialogue.show(this.activeInteraction.data.targetName, entry.lines);
  }
}
```

- [ ] **En el método `create()`, agregar fadeIn al final (después de `this.cameras.main.setRoundPixels(true)`):**

```ts
this.cameras.main.fadeIn(300, 0, 0, 0);
```

- [ ] **Verificar tipos:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

- [ ] **Commit:**

```bash
git add src/game/scenes/PlazaScene.ts
git commit -m "feat(plaza): trigger interior scene transition on E-press at entrance zones"
```

---

## Task 7: Ajustar exitZones y colliders con physics debug

Esta es la tarea de inspección visual. Los pasos siguientes explican exactamente cómo encontrar las coordenadas correctas.

**Files:**
- Modify: `src/game/data/maps/interiors.ts`
- Modify: `src/game/main.ts` (temporalmente)

- [ ] **Habilitar physics debug en `src/game/main.ts` temporalmente:**

```ts
arcade: {
  gravity: { x: 0, y: 0 },
  debug: true,   // ← cambiar a true
},
```

- [ ] **Correr el servidor de desarrollo:**

```bash
cd /home/guille/code/regalo && npm run dev
```

- [ ] **Abrir el browser en `http://localhost:3000`, loguearse, entrar a cada interior y ajustar `exitZone` y `colliders`.**

  **Cómo encontrar la exitZone (línea amarilla):**
  1. Abrí la imagen límites del interior en un visor de imágenes (ej: `eog "sprites/interiores/castillo limites.webp"`)
  2. Mové el mouse sobre la línea amarilla y anotá las coordenadas X/Y que muestra el visor
  3. La zona amarilla suele ser una franja horizontal — definila como `{ x: leftEdge, y: topEdge, width: lineWidth, height: 20 }`
  4. Actualizá el valor en `interiors.ts` y verificá en el juego que el personaje salga al pisarla

  **Cómo agregar colliders (líneas blancas):**
  1. En la misma imagen de límites, identificá cada segmento recto de línea blanca
  2. Para cada segmento, anotá: esquina superior-izquierda (x, y), ancho y alto
  3. Las líneas suelen tener 8-16px de grosor — usá ese valor como `height` para horizontales o `width` para verticales
  4. Agregalos al array `colliders` del interior correspondiente en `interiors.ts`
  5. Con debug activo vas a ver los rectángulos azules en el juego — ajustá hasta que coincidan con las paredes visibles

- [ ] **Deshabilitar physics debug cuando los colliders estén bien:**

```ts
debug: false,
```

- [ ] **Commit con los colliders y zonas finales:**

```bash
git add src/game/data/maps/interiors.ts src/game/main.ts
git commit -m "feat(data): add exit zones and colliders for all interiors"
```

---

## Task 8: Agregar botones de Casa de los pensamientos

**Files:**
- Modify: `src/game/data/maps/interiors.ts`

Esta tarea depende de Task 7 porque necesitás identificar visualmente dónde están los botones.

- [ ] **Con physics debug activo, abrir `sprites/interiores/casa de los recuerdos limites y botones.webp`.**

  Los botones aparecen como íconos de teclado en la imagen de referencia. Para cada botón:
  1. Anotá la posición X/Y del centro del botón en la imagen
  2. Estimá el tamaño (normalmente ~40×40px para este tipo de sprites)
  3. La `x` y `y` del `ButtonDefinition` es la esquina superior-izquierda: `x = centerX - width/2`, `y = centerY - height/2`

- [ ] **Actualizar el array `buttons` de `"casa-pensamientos"` en `interiors.ts` con las posiciones reales:**

```ts
buttons: [
  { id: "btn-1", x: /* esquina izq */ 0, y: /* esquina top */ 0, width: 40, height: 40 },
  // agregar más si hay más botones en la imagen de referencia
],
```

- [ ] **Verificar en el juego:** entrar a Casa de los pensamientos, pisar cada botón, verificar que el sprite cambia a `tecla_presionada` y que aparece el `console.log` en el navegador.

- [ ] **Commit:**

```bash
git add src/game/data/maps/interiors.ts
git commit -m "feat(data): add button positions for Casa de los pensamientos"
```

---

## Task 9: Verificación end-to-end

- [ ] **Correr el tipo check final:**

```bash
cd /home/guille/code/regalo && npx tsc --noEmit
```

Expected: 0 errores.

- [ ] **Probar el flujo completo:**

  1. Login → plaza → presionar E en "Castillo" → fade negro → aparece interior castillo → mover personaje → pisar zona amarilla → fade negro → volver a plaza ✓
  2. Lo mismo con "Casa de los pensamientos" → verificar botones con console.log ✓
  3. Lo mismo con "Discoteca" ✓
  4. Lo mismo con "Casa" ✓
  5. Verificar que las interacciones sin interior (ej: `fondo-sur`) siguen mostrando diálogo ✓
  6. Verificar que los colliders de cada interior bloquean correctamente el movimiento ✓

- [ ] **Commit final si hay ajustes menores:**

```bash
git add -p
git commit -m "fix(interiors): final adjustments after e2e verification"
```
