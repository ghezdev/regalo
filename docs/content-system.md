# Sistema De Contenido

El proyecto debe separar contenido de logica para que un agente pueda agregar detalles sin tocar sistemas internos.

## Usuarios

Archivo recomendado: `src/game/data/users.ts`

```ts
export const users = [
  {
    username: "naomi",
    password: "luna",
    displayName: "Naomi",
    characterId: "naomi",
  },
  {
    username: "guillermo",
    password: "maia",
    displayName: "Guillermo",
    characterId: "guillermo",
  },
];
```

## Personajes

Archivo recomendado: `src/game/data/characters.ts`

Cada personaje debe definir:

- id;
- nombre visible;
- spritesheet;
- frame size;
- animaciones;
- spawn default.

Personajes iniciales:

- `naomi`: personaje femenino;
- `guillermo`: personaje masculino.

## Mapa De Plaza

Archivo recomendado: `src/game/data/maps/plaza.ts`

Debe definir:

- dimensiones;
- tile size;
- spawns;
- capas o grilla de tiles;
- objetos decorativos;
- zonas de colision;
- zonas de interaccion;
- edificios.

## Edificios

Archivo recomendado: `src/game/data/buildings.ts`

Edificios planeados:

```ts
export const buildings = [
  {
    id: "dance-room",
    name: "Pista de baile",
    status: "future",
    plazaInteractionId: "dance-room-closed",
  },
  {
    id: "photo-room",
    name: "Habitacion de fotos",
    status: "future",
    plazaInteractionId: "photo-room-closed",
  },
  {
    id: "audio-calendar",
    name: "Calendario de audios",
    status: "future",
    plazaInteractionId: "audio-calendar-closed",
  },
  {
    id: "home",
    name: "Nuestra casa",
    status: "future",
    plazaInteractionId: "home-closed",
  },
  {
    id: "mailbox",
    name: "Buzon",
    status: "future",
    plazaInteractionId: "mailbox-placeholder",
  },
];
```

## Dialogos

Archivo recomendado: `src/game/data/dialogues.ts`

Formato conceptual:

```ts
export const dialogues = {
  "fountain-message": [
    "Esta plaza existe porque queria construirte un lugar solo para vos.",
    "Todavia hay puertas cerradas, pero cada una guarda algo nuestro.",
  ],
  "dance-room-closed": [
    "La pista de baile todavia esta en preparacion.",
    "Pronto va a sonar una cancion elegida para este momento.",
  ],
};
```

Los textos finales deben ser personalizados por Guillermo. Los agentes pueden usar placeholders romanticos, pero no deben inventar recuerdos reales sin confirmacion.

## Musica

Archivo recomendado: `src/game/data/music.ts`

```ts
export const musicTracks = {
  plazaNight: {
    id: "plaza-night",
    title: "Plaza de noche",
    src: "/assets/audio/plaza-night-placeholder.mp3",
    loop: true,
    volume: 0.45,
  },
};
```

## Fotos

Carpeta recomendada: `public/assets/photos`

Archivo futuro: `src/game/data/photos.ts`

```ts
export const photos = [
  {
    id: "photo-001",
    title: "Placeholder",
    src: "/assets/photos/photo-001.jpg",
    caption: "Texto pendiente.",
    date: null,
  },
];
```

## Audios Del Calendario

Carpeta recomendada: `public/assets/audio/calendar`

Archivo futuro: `src/game/data/calendar-audios.ts`

```ts
export const calendarAudios = [
  {
    date: "2026-01-01",
    title: "Placeholder",
    src: "/assets/audio/calendar/2026-01-01.mp3",
  },
];
```

## Gatos

Archivo futuro: `src/game/data/cats.ts`

Gatos planeados:

- gato blanco con manchas naranjas, marrones y negras;
- gato naranja.

Cada gato puede tener:

- id;
- nombre;
- sprite;
- posicion;
- ruta simple;
- dialogos al interactuar.

