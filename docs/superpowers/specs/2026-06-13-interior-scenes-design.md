# Interior Scenes — Design Spec
**Date:** 2026-06-13

## Objetivo

Cuando el jugador interactúa con una zona de entrada en la plaza, la escena cambia al interior correspondiente con una transición fade. Cada interior tiene colisiones invisibles, una zona de salida (línea amarilla) que devuelve al jugador a la plaza, y opcionalmente botones presionables (Casa de los pensamientos).

---

## Interiores en scope

| ID | Fondo | Límites | Botones |
|---|---|---|---|
| `castillo` | `castillo.png` | `castillo limites.webp` | No |
| `casa-pensamientos` | `casa de los recuerdos.png` | `casa de los recuerdos limites y botones.webp` | Sí |
| `discoteca` | `discoteca.png` | `discoteca limites.webp` | No |
| `casa` | `casa.jpg` | `casa limites.webp` | No |
| `cine` | `cine.png` | sin límites | Fuera de scope por ahora |

**Mapeo de interacciones plaza → interior:**
- `castle-entrance` → `castillo`
- `entrada-izq` → `casa-pensamientos`
- `discoteca` → `discoteca`
- `zona-sur-der` → `casa`
- `entrada-der` (Cine) → omitido por ahora

---

## Arquitectura

### Archivos nuevos
- `src/game/scenes/InteriorScene.ts` — escena Phaser genérica para todos los interiores
- `src/game/data/maps/interiors.ts` — definición de datos por interior (colliders, exit zone, botones)

### Archivos modificados
- `BootScene.ts` — preload de fondos interiores y sprites de botones
- `main.ts` — registro de `InteriorScene` en el array de escenas
- `PlazaScene.ts` — al activar una interacción que tiene interior, hace fadeOut + scene switch en vez de mostrar diálogo

---

## Datos por interior (`InteriorDefinition`)

```ts
interface ButtonDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InteriorDefinition {
  id: string;
  bgKey: string;
  worldWidth: number;
  worldHeight: number;
  colliders: { x: number; y: number; width: number; height: number }[];
  exitZone: { x: number; y: number; width: number; height: number };
  buttons?: ButtonDefinition[];
}
```

Los colliders se derivan a mano mirando las imágenes `*limites*.webp`. Empezamos con `colliders: []` y los refinamos con la escena corriendo.

**Spawn = Exit zone:** el jugador aparece en la `exitZone` al entrar al interior. Si vuelve a pisarla, sale.

---

## InteriorScene

- Recibe `{ interiorId: string; session: GameSession }` via `scene.start()`
- `preload()`: no hace nada (assets ya cargados en Boot)
- `create()`:
  1. Dibuja el fondo con la `bgKey` del interior
  2. Crea colliders estáticos desde `interiorDef.colliders`
  3. Spawna al jugador en el centro de `exitZone`
  4. Crea zona de salida (`exitZone`) como physics zone
  5. Si hay botones: crea sprites `tecla` + physics zone por cada uno
  6. Hace `cameras.main.fadeIn(300)`
- `update()`:
  - Movimiento del jugador (mismo sistema que PlazaScene)
  - Overlap con `exitZone` → `fadeOut(300)` → `scene.start("plaza", { session })`
  - Overlap con botón → muestra `tecla_presionada`, `console.log`; al dejar overlap → `tecla`

---

## Transición fade

API nativa de Phaser:
```ts
this.cameras.main.fadeOut(300, 0, 0, 0);
this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
  this.scene.start("interior", { interiorId: "castillo", session });
});
```

Duración: 300ms. Color: negro (`0, 0, 0`). La escena destino llama `fadeIn(300)` al crear.

Al salir del interior de vuelta a la plaza, se pasa `session` para que PlazaScene use el spawn correcto del personaje.

---

## Botones (Casa de los pensamientos)

- Sprites cargados en Boot: `tecla` (`tecla.png`), `tecla-presionada` (`tecla_presionada.webp`)
- Un `Phaser.GameObjects.Sprite` por botón, posicionado según los datos del interior
- Physics zone superpuesta al sprite para detectar overlap con el jugador
- Overlap activo → `sprite.setTexture("tecla-presionada")` + `console.log("botón ${id} presionado")`
- Sin overlap → `sprite.setTexture("tecla")`
- La lógica funcional de los botones se implementa en una iteración futura

---

## Fuera de scope

- Cine (no tiene límites definidos aún)
- Lógica funcional de los botones (por ahora solo console.log)
- Música/audio por interior
- Animaciones de entrada al interior más elaboradas
