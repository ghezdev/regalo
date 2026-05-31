# Guia Para Agentes

Este proyecto debe ser facil de modificar por agentes. Antes de implementar, leer:

1. `README.md`
2. `docs/product-spec.md`
3. `docs/technical-architecture.md`
4. `docs/roadmap.md`
5. `docs/art-direction.md`

## Prioridad De Trabajo

La prioridad es construir una experiencia pequena y muy pulida.

Orden recomendado:

1. login simple;
2. base Next.js + Phaser;
3. escena de plaza;
4. movimiento y colisiones;
5. personajes;
6. arte placeholder consistente;
7. dialogos;
8. musica;
9. pulido visual;
10. deploy.

## Reglas De Producto

- La web es un regalo para Naomi.
- El tono debe ser romantico, nostalgico y detallista.
- La plaza es el centro de la primera version.
- Los interiores se preparan, pero no se implementan en el primer MVP salvo que se pida explicitamente.
- No copiar assets oficiales de Pokemon.
- No sobrearquitecturar.

## Reglas Tecnicas

- Usar TypeScript.
- Usar Phaser para el juego.
- Cargar Phaser solo del lado cliente.
- Mantener contenido separado de logica.
- Evitar base de datos al inicio.
- Evitar autenticacion real al inicio.
- Usar `localStorage` para sesion simple.
- Usar assets en `public/assets`.

## Reglas De Diseno

- Pixel art consistente.
- Interfaz tipo RPG.
- No hacer landing page.
- La primera pantalla despues del login debe ser el juego.
- Mantener la UI limpia y romantica.
- Evitar componentes modernos que rompan la estetica.
- No usar assets oficiales de Pokemon.

## Como Agregar Contenido

Agregar contenido modificando archivos de datos, no metiendo texto dentro de sistemas de juego.

Ejemplos:

- dialogos: `src/game/data/dialogues.ts`;
- edificios: `src/game/data/buildings.ts`;
- musica: `src/game/data/music.ts`;
- mapa: `src/game/data/maps/plaza.ts`;
- personajes: `src/game/data/characters.ts`.

## Como Agregar Un Edificio

1. Agregar definicion del edificio en `buildings.ts`.
2. Agregar objeto en `maps/plaza.ts`.
3. Agregar dialogo placeholder en `dialogues.ts`.
4. Agregar colision si corresponde.
5. Agregar zona de interaccion.
6. Verificar que no bloquee caminos principales.

## Como Agregar Una Habitacion Futura

1. Crear nueva escena Phaser.
2. Definir mapa de interior.
3. Crear puerta de entrada en plaza.
4. Agregar transicion desde plaza.
5. Definir spawn de regreso.
6. Mantener el contenido de la habitacion en archivos de datos.

## Definition Of Done Para MVP

El MVP esta listo cuando:

- el login acepta `naomi/luna` y `guillermo/maia`;
- cada usuario entra con su personaje correcto;
- el juego carga en `/game`;
- el personaje se mueve en cuatro direcciones;
- hay colisiones basicas;
- la camara sigue al personaje;
- la plaza se ve romantica y pulida;
- hay musica ambiente activable;
- hay al menos una interaccion con dialogo;
- hay edificios decorativos visibles;
- el build pasa;
- esta desplegable en Vercel.

## Evitar

- multiplayer;
- bases de datos prematuras;
- auth real;
- mapas gigantes;
- features interiores antes de tener la plaza pulida;
- copiar Pokemon;
- mezclar contenido romantico con logica del motor.

