# Deploy y Multiplayer en Vivo — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el juego en una URL pública con Vercel y agregar sincronización en tiempo real de posiciones via PartyKit para que Naomi y Guillermo se vean mutuamente en el mapa.

**Architecture:** El frontend Next.js se despliega en Vercel. Un servidor PartyKit minimalista corre en Cloudflare Workers y actúa como relay: reenvía el estado de cada jugador (posición, dirección, escena) al otro jugador. Cada escena de Phaser (PlazaScene, InteriorScene) lee la última actualización recibida y renderiza un sprite secundario con el personaje remoto.

**Tech Stack:** Next.js 15, Phaser 3, PartyKit (`partykit` + `partysocket`), Vercel

---

## Mapa de Archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `party/game-room.ts` | Crear | Servidor PartyKit: relay de mensajes entre las dos conexiones |
| `partykit.json` | Crear | Config de PartyKit (nombre del proyecto, entry point) |
| `src/game/systems/multiplayer.ts` | Crear | Cliente multiplayer: conectar a PartyKit, enviar posición, recibir actualizaciones |
| `src/game/types/game.ts` | Modificar | Agregar tipo `PlayerUpdate` y `Direction` |
| `src/game/main.ts` | Modificar | Crear `MultiplayerClient` y guardarlo en `game.registry` |
| `src/game/scenes/PlazaScene.ts` | Modificar | Conectar a multiplayer, enviar posición propia, renderizar jugador remoto |
| `src/game/scenes/InteriorScene.ts` | Modificar | Ídem para escenas interiores |

---

## Task 1: Verificar que el build pasa

**Files:**
- No changes — solo verificación

- [ ] **Step 1: Correr el build de producción**

```bash
npm run build
```

Expected: termina sin errores TypeScript ni errores de Next.js. Si hay errores, corregirlos antes de continuar.

- [ ] **Step 2: Correr el linter**

```bash
npm run lint
```

Expected: 0 warnings, 0 errors.

- [ ] **Step 3: Commit del estado actual de la rama**

```bash
git add -A
git commit -m "chore: pre-deploy cleanup — branch ready for merge"
```

---

## Task 2: Mergear a main y publicar en Vercel

**Files:**
- No code changes — configuración de hosting

- [ ] **Step 1: Mergear la rama actual a main**

```bash
git checkout main
git merge plaza-redesign
git push origin main
```

- [ ] **Step 2: Crear proyecto en Vercel (paso manual)**

1. Ir a [vercel.com](https://vercel.com) → "Add New Project"
2. Importar el repositorio de GitHub
3. Vercel detecta Next.js automáticamente — no tocar configuración de build
4. Click "Deploy"
5. Esperar a que termine el primer deploy

Expected: Vercel genera una URL tipo `regalo-abc123.vercel.app`. El juego debe cargar y funcionar en single-player.

- [ ] **Step 3: Verificar la URL pública**

Abrir la URL en el navegador:
- Login con `naomi / luna` → debe llegar a la plaza
- Login con `guillermo / maia` → debe llegar a la plaza
- Verificar que el personaje se mueve y que los interiores funcionan

---

## Task 3: Instalar dependencias de PartyKit

**Files:**
- `package.json` (modificado por npm)

- [ ] **Step 1: Instalar partykit y partysocket**

```bash
npm install partysocket
npm install --save-dev partykit
```

`partysocket` es la librería cliente (runtime del browser). `partykit` es el CLI/servidor (solo dev).

Expected: ambos aparecen en `package.json`.

---

## Task 4: Crear el servidor PartyKit

**Files:**
- Create: `party/game-room.ts`
- Create: `partykit.json`

- [ ] **Step 1: Crear `partykit.json`**

```json
{
  "name": "regalo-game",
  "main": "party/game-room.ts"
}
```

El campo `name` determina la URL de producción: `regalo-game.<tu-usuario>.partykit.dev`.

- [ ] **Step 2: Crear `party/game-room.ts`**

```typescript
import type * as Party from "partykit/server";

export default class GameRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    // Relay the message to all other connections (not back to sender)
    this.room.broadcast(message, [sender.id]);
  }
}
```

Este servidor no guarda estado. Solo retransmite cada mensaje al otro jugador conectado.

- [ ] **Step 3: Verificar que el servidor arranca localmente**

```bash
npx partykit dev
```

Expected: output similar a:
```
🎈 PartyKit dev server started
http://localhost:1999
```

Dejar corriendo en otra terminal para los siguientes pasos de prueba. Ctrl+C cuando no sea necesario.

---

## Task 5: Agregar tipos de multiplayer a `game.ts`

**Files:**
- Modify: `src/game/types/game.ts`

- [ ] **Step 1: Agregar `Direction` y `PlayerUpdate` al archivo de tipos**

Abrir `src/game/types/game.ts` y agregar al final:

```typescript
export type Direction = "up" | "down" | "left" | "right";

export interface PlayerUpdate {
  characterId: CharacterId;
  x: number;
  y: number;
  direction: Direction;
  moving: boolean;
  scene: string; // "plaza" | "interior:castillo" | "interior:discoteca" | etc.
}
```

---

## Task 6: Crear el sistema de multiplayer cliente

**Files:**
- Create: `src/game/systems/multiplayer.ts`

- [ ] **Step 1: Crear `src/game/systems/multiplayer.ts`**

```typescript
import PartySocket from "partysocket";
import type { CharacterId, Direction, PlayerUpdate } from "../types/game";

type RemoteUpdateCallback = (update: PlayerUpdate) => void;

export class MultiplayerClient {
  private socket: PartySocket;
  private characterId: CharacterId;
  private currentScene = "plaza";
  private onRemoteUpdate: RemoteUpdateCallback | null = null;
  private lastSentAt = 0;
  private static readonly SEND_INTERVAL_MS = 50;

  constructor(host: string, characterId: CharacterId) {
    this.characterId = characterId;
    this.socket = new PartySocket({ host, room: "regalo-game" });

    this.socket.addEventListener("message", (event) => {
      try {
        const update = JSON.parse(event.data as string) as PlayerUpdate;
        this.onRemoteUpdate?.(update);
      } catch {
        // ignore malformed messages
      }
    });
  }

  setScene(scene: string) {
    this.currentScene = scene;
  }

  onUpdate(callback: RemoteUpdateCallback) {
    this.onRemoteUpdate = callback;
  }

  sendPosition(x: number, y: number, direction: Direction, moving: boolean) {
    const now = Date.now();
    if (now - this.lastSentAt < MultiplayerClient.SEND_INTERVAL_MS) return;
    this.lastSentAt = now;

    const update: PlayerUpdate = {
      characterId: this.characterId,
      x,
      y,
      direction,
      moving,
      scene: this.currentScene,
    };
    this.socket.send(JSON.stringify(update));
  }

  destroy() {
    this.socket.close();
  }
}
```

`sendPosition` está throttleado a 20 envíos por segundo (cada 50ms), suficiente para movimiento fluido sin saturar la conexión.

---

## Task 7: Inicializar multiplayer en `main.ts`

**Files:**
- Modify: `src/game/main.ts`

El `MultiplayerClient` se crea una sola vez al iniciar el juego y se guarda en `game.registry` para que cualquier escena pueda accederlo.

- [ ] **Step 1: Modificar `src/game/main.ts`**

Agregar el import al inicio:

```typescript
import { MultiplayerClient } from "./systems/multiplayer";
```

Y dentro de `createGame`, antes de crear `new Phaser.Game(...)`:

```typescript
const partykitHost =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";
const multiplayer = new MultiplayerClient(partykitHost, session.characterId);
```

Después de crear el juego, antes del `return`:

```typescript
game.registry.set("multiplayer", multiplayer);

game.events.once("destroy", () => {
  multiplayer.destroy();
});
```

El archivo completo quedará:

```typescript
import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { BootScene } from "./scenes/BootScene";
import { PlazaScene } from "./scenes/PlazaScene";
import { InteriorScene } from "./scenes/InteriorScene";
import type { GameSession } from "./types/game";
import { resetGameOverlayState } from "./ui-overlay-store";
import { MultiplayerClient } from "./systems/multiplayer";

export function createGame(container: HTMLElement, session: GameSession) {
  resetGameOverlayState();

  const partykitHost =
    process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";
  const multiplayer = new MultiplayerClient(partykitHost, session.characterId);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#0d1330",
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    autoRound: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene, PlazaScene, InteriorScene],
  });

  game.registry.set("multiplayer", multiplayer);

  game.events.once("destroy", () => {
    multiplayer.destroy();
  });

  game.scene.start("boot", { session });

  return game;
}
```

---

## Task 8: Integrar multiplayer en PlazaScene

**Files:**
- Modify: `src/game/scenes/PlazaScene.ts`

- [ ] **Step 1: Agregar imports nuevos**

Al inicio de `PlazaScene.ts`, agregar estas dos líneas de import:

```typescript
import type { GameSession, Direction, PlayerUpdate } from "../types/game";
import type { MultiplayerClient } from "../systems/multiplayer";
```

`Direction` y `PlayerUpdate` viven en `types/game.ts` (donde se definieron en Task 5). `MultiplayerClient` vive en `systems/multiplayer.ts`.

- [ ] **Step 2: Agregar propiedades de clase**

Dentro de `export class PlazaScene`, después de las propiedades existentes:

```typescript
private multiplayer!: MultiplayerClient;
private remotePlayer: Phaser.Physics.Arcade.Sprite | null = null;
private lastRemoteUpdate: PlayerUpdate | null = null;
```

- [ ] **Step 3: Conectar multiplayer en `create()`**

Al final de `create()`, antes del cierre de la función, agregar:

```typescript
// ── Multiplayer ───────────────────────────────────────────────
this.multiplayer = this.registry.get("multiplayer") as MultiplayerClient;
this.multiplayer.setScene("plaza");
this.multiplayer.onUpdate((update) => {
  this.lastRemoteUpdate = update;
});
```

- [ ] **Step 4: Enviar posición propia y renderizar jugador remoto en `update()`**

Al final del método `update()`, después de `this.refreshInteractionState()`:

```typescript
// ── Multiplayer: send own position ────────────────────────────
const body = this.player.body as Phaser.Physics.Arcade.Body;
const moving = body.velocity.lengthSq() > 0;
const direction = (this.player.getData("lastDirection") ?? "down") as Direction;
this.multiplayer.sendPosition(this.player.x, this.player.y, direction, moving);

// ── Multiplayer: render remote player ────────────────────────
if (this.lastRemoteUpdate) {
  this.updateRemotePlayer(this.lastRemoteUpdate);
}
```

- [ ] **Step 5: Agregar el método `updateRemotePlayer`**

Al final de la clase, antes del cierre `}`:

```typescript
private updateRemotePlayer(update: PlayerUpdate) {
  if (update.scene !== "plaza") {
    this.remotePlayer?.setVisible(false);
    return;
  }

  if (!this.remotePlayer) {
    const textureKey = `character-${update.characterId}`;
    this.remotePlayer = this.physics.add
      .sprite(update.x, update.y, textureKey, 0)
      .setSize(30, 20)
      .setOffset(10, 28)
      .setDepth(1)
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
    const frameLookup: Record<Direction, number> = {
      down: 0, left: 4, right: 8, up: 12,
    };
    this.remotePlayer.setFrame(frameLookup[update.direction]);
  }
}
```

El `setAlpha(0.85)` diferencia visualmente al personaje remoto del propio.

- [ ] **Step 6: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

---

## Task 9: Integrar multiplayer en InteriorScene

**Files:**
- Modify: `src/game/scenes/InteriorScene.ts`

- [ ] **Step 1: Agregar imports**

Al inicio de `InteriorScene.ts`, agregar estas dos líneas de import:

```typescript
import type { GameSession, Direction, PlayerUpdate } from "../types/game";
import type { MultiplayerClient } from "../systems/multiplayer";
```

- [ ] **Step 2: Agregar propiedades de clase**

Dentro de `export class InteriorScene`, después de `private previousActiveButtonId`:

```typescript
private multiplayer!: MultiplayerClient;
private remotePlayer: Phaser.Physics.Arcade.Sprite | null = null;
private lastRemoteUpdate: PlayerUpdate | null = null;
```

- [ ] **Step 3: Conectar multiplayer en `create()`**

Al final de `create()`, después de `this.cameras.main.fadeIn(...)`:

```typescript
// ── Multiplayer ───────────────────────────────────────────────
this.multiplayer = this.registry.get("multiplayer") as MultiplayerClient;
this.multiplayer.setScene(`interior:${this.interiorId}`);
this.multiplayer.onUpdate((update) => {
  this.lastRemoteUpdate = update;
});
```

- [ ] **Step 4: Enviar posición y renderizar jugador remoto en `update()`**

Al final del bloque de `update()`, después de la lógica de botones:

```typescript
// ── Multiplayer: send own position ────────────────────────────
const body = this.player.body as Phaser.Physics.Arcade.Body;
const moving = body.velocity.lengthSq() > 0;
const direction = (this.player.getData("lastDirection") ?? "down") as Direction;
this.multiplayer.sendPosition(this.player.x, this.player.y, direction, moving);

// ── Multiplayer: render remote player ────────────────────────
if (this.lastRemoteUpdate) {
  this.updateRemotePlayer(this.lastRemoteUpdate);
}
```

- [ ] **Step 5: Agregar el método `updateRemotePlayer`**

Al final de la clase, antes del cierre `}`:

```typescript
private updateRemotePlayer(update: PlayerUpdate) {
  const expectedScene = `interior:${this.interiorId}`;
  if (update.scene !== expectedScene) {
    this.remotePlayer?.setVisible(false);
    return;
  }

  if (!this.remotePlayer) {
    const textureKey = `character-${update.characterId}`;
    this.remotePlayer = this.physics.add
      .sprite(update.x, update.y, textureKey, 0)
      .setSize(30, 20)
      .setOffset(10, 28)
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
    const frameLookup: Record<Direction, number> = {
      down: 0, left: 4, right: 8, up: 12,
    };
    this.remotePlayer.setFrame(frameLookup[update.direction]);
  }
}
```

- [ ] **Step 6: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

---

## Task 10: Probar multiplayer localmente

**Files:**
- No changes — testing only

- [ ] **Step 1: Asegurarse de que PartyKit dev está corriendo**

En una terminal:
```bash
npx partykit dev
```

Expected: `http://localhost:1999` corriendo.

- [ ] **Step 2: Correr Next.js en otra terminal**

```bash
npm run dev
```

Expected: `http://localhost:3000` corriendo.

- [ ] **Step 3: Abrir dos pestañas del navegador**

- Pestaña 1: `http://localhost:3000` → login como `naomi / luna`
- Pestaña 2: `http://localhost:3000` → login como `guillermo / maia`

- [ ] **Step 4: Verificar sincronización**

- Mover el personaje en pestaña 1 → debe aparecer en pestaña 2 moviéndose
- Mover en pestaña 2 → debe aparecer en pestaña 1
- Entrar a un interior en pestaña 1 → el personaje de pestaña 1 debe desaparecer en pestaña 2 (está en otra escena)
- Entrar al mismo interior en pestaña 2 → ambos personajes deben verse dentro del interior

- [ ] **Step 5: Commit**

```bash
git add party/ partykit.json src/game/systems/multiplayer.ts src/game/types/game.ts src/game/main.ts src/game/scenes/PlazaScene.ts src/game/scenes/InteriorScene.ts package.json package-lock.json
git commit -m "feat: add PartyKit multiplayer — real-time position sync between two players"
```

---

## Task 11: Deployar PartyKit a producción

**Files:**
- No code changes — deploy

- [ ] **Step 1: Crear cuenta en PartyKit (si no existe)**

Ir a [partykit.io](https://partykit.io) y crear una cuenta gratuita.

- [ ] **Step 2: Login en CLI**

```bash
npx partykit login
```

Sigue el flujo de autenticación en el navegador.

- [ ] **Step 3: Deployar el servidor**

```bash
npx partykit deploy
```

Expected: output con la URL del servidor, tipo:
```
🎈 Deployed regalo-game to regalo-game.<tu-usuario>.partykit.dev
```

Copiar esa URL (sin `https://`), por ejemplo: `regalo-game.guillermo.partykit.dev`

---

## Task 12: Configurar env var en Vercel y redesployar

**Files:**
- No code changes — configuración de Vercel

- [ ] **Step 1: Agregar variable de entorno en Vercel**

1. Ir al proyecto en [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Agregar:
   - Name: `NEXT_PUBLIC_PARTYKIT_HOST`
   - Value: `regalo-game.<tu-usuario>.partykit.dev` (la URL del paso anterior, sin `https://`)
   - Environment: Production, Preview, Development

- [ ] **Step 2: Redesployar**

En Vercel, ir a Deployments → click en "Redeploy" en el último deploy.

O hacer un push vacío para triggerear:
```bash
git commit --allow-empty -m "chore: trigger redeploy with PartyKit env var"
git push origin main
```

- [ ] **Step 3: Verificar en producción**

- Abrir la URL de Vercel en dos navegadores distintos (o uno normal y uno en incógnito)
- Login como `naomi` en uno y `guillermo` en el otro
- Verificar que se ven en tiempo real
