# Arquitectura Tecnica

## Stack

- Next.js con App Router
- React
- TypeScript
- Phaser 3
- Vercel

## Por Que Este Stack

Next.js encaja con Vercel y permite combinar una web normal con un canvas de juego. Phaser resuelve el dominio del juego 2D: sprites, animaciones, tilemaps, camara, escenas, colisiones e input.

El proyecto debe mantenerse liviano. La mayor parte del contenido debe ser estatico.

## Estructura Recomendada

```txt
src/
  app/
    page.tsx
    game/
      page.tsx
    api/
      send-note/
        route.ts
  components/
    LoginScreen.tsx
    GameCanvas.tsx
    PixelModal.tsx
    AudioToggle.tsx
  game/
    main.ts
    config.ts
    scenes/
      BootScene.ts
      PlazaScene.ts
    systems/
      movement.ts
      collisions.ts
      dialogue.ts
      interactions.ts
      camera.ts
      audio.ts
    data/
      users.ts
      characters.ts
      maps/
        plaza.ts
      buildings.ts
      dialogues.ts
      music.ts
    types/
      content.ts
      game.ts
public/
  assets/
    sprites/
      characters/
      cats/
      objects/
    tiles/
    maps/
    photos/
    audio/
    fonts/
```

## Rutas

### `/`

Pantalla de login.

Responsabilidades:

- mostrar formulario pixel art;
- validar username y password contra usuarios fijos;
- guardar sesion simple en `localStorage`;
- redirigir a `/game`.

### `/game`

Pantalla del juego.

Responsabilidades:

- verificar marca de login en `localStorage`;
- cargar Phaser solo en cliente;
- pasar el usuario/personaje elegido al juego;
- renderizar overlays React si hacen falta.

### `/api/send-note`

Ruta futura para enviar email desde el buzon.

No es necesaria para el MVP de plaza pulida, pero la arquitectura debe dejar lugar para agregarla.

## Login Simple

Usuarios propuestos:

```ts
export const USERS = [
  {
    username: "naomi",
    password: "luna",
    characterId: "naomi",
    displayName: "Naomi",
  },
  {
    username: "guillermo",
    password: "maia",
    characterId: "guillermo",
    displayName: "Guillermo",
  },
];
```

Sesion local:

```ts
localStorage.setItem("regalo.session", JSON.stringify({
  username,
  characterId,
  displayName,
}));
```

No usar cookies, JWT, OAuth ni providers externos para el MVP.

## Integracion Next.js + Phaser

Phaser debe cargarse solo en cliente para evitar errores de SSR.

Patron recomendado:

- `GameCanvas.tsx` es un componente cliente;
- importa Phaser dinamicamente o importa un inicializador que solo corre en `useEffect`;
- destruye la instancia de Phaser al desmontar.

Ejemplo conceptual:

```ts
useEffect(() => {
  const game = createGame(containerRef.current, session);
  return () => game.destroy(true);
}, [session]);
```

## Resolucion Y Escalado

Usar resolucion interna baja y escalar con pixel-perfect.

Recomendacion inicial:

- tile size: `16x16`;
- viewport interno: `400x240` o `320x180`;
- escala visual: ajustar al contenedor;
- pixel art: `image-rendering: pixelated`.

El juego debe verse bien en desktop y mobile, aunque el control principal del MVP puede estar pensado para teclado.

## Movimiento

Para MVP:

- movimiento libre en cuatro direcciones con colisiones;
- teclas: `WASD` y flechas;
- interactuar: `E` o `Enter`;
- camara sigue al jugador.

No implementar pathfinding ni multiplayer.

## Mapas

Para que el proyecto sea agent-friendly, empezar con mapas definidos en TypeScript/JSON en vez de depender de Tiled.

Ventajas:

- un agente puede editar coordenadas, edificios y decoracion;
- los diffs son claros;
- no hay dependencia de una herramienta visual;
- se puede migrar a Tiled mas adelante si el mapa crece.

Formato conceptual:

```ts
export const plazaMap = {
  id: "plaza",
  width: 40,
  height: 28,
  tileSize: 16,
  spawn: {
    naomi: { x: 20, y: 18 },
    guillermo: { x: 21, y: 18 },
  },
  objects: [
    {
      id: "central-fountain",
      type: "fountain",
      x: 18,
      y: 10,
      width: 4,
      height: 4,
      collision: true,
      interactionId: "fountain-message",
    },
  ],
};
```

## Contenido Editable

Todo lo que pueda ser contenido debe vivir en archivos separados:

- usuarios;
- personajes;
- dialogos;
- edificios;
- musica;
- fotos;
- audios;
- mapa;
- interacciones.

La logica del motor no debe tener textos romanticos hardcodeados salvo placeholders tecnicos.

## Email Futuro

Para el buzon:

- usar API route de Next.js;
- usar Resend;
- validar longitud maxima del mensaje;
- enviar email a Guillermo;
- no guardar el mensaje en base de datos para MVP.

Variables futuras:

```txt
RESEND_API_KEY=
NOTE_TO_EMAIL=
NOTE_FROM_EMAIL=
```

## Deploy

Deploy recomendado:

- Vercel conectado al repo;
- variables de entorno solo cuando se agregue email;
- build normal de Next.js.

No usar Docker ni servidores dedicados.

