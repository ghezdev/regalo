# Rediseño visual de la plaza — Diseño

Fecha: 2026-05-31
Estado: aprobado (pendiente revisión final del usuario)

## Objetivo

Acercar la experiencia a la estética de un RPG pixel art romántico y nocturno
inspirado en Pokémon FireRed (ver `images/example game.png`), sin copiar assets
oficiales. Hoy todo se dibuja con formas primitivas de Phaser (rectángulos y
elipses) y sprites generados por código, por lo que la escena se lee como bloques
de color planos (`images/current game.png`). Este trabajo eleva la calidad visual
manteniendo el enfoque 100% procedural y editable por agentes.

## Decisiones acordadas

- **Arte procedural enriquecido**: todo se sigue dibujando por código. No se
  introducen archivos PNG ni binarios. Se mantiene editable por agentes según
  `docs/art-direction.md` y `docs/agent-guide.md`.
- **Lienzo + estructura completa**: se rediseña el arte de la plaza Y el layout
  React. Se elimina la barra lateral derecha (`Sesion / Controles / MVP`). El
  juego pasa a ser full-bleed. **No** se copia la barra inferior de la imagen de
  referencia.
- **Fuente como centro**: la fuente central sigue siendo el centro emocional del
  mapa (según `docs/product-spec.md`), no se reemplaza por un castillo.
- **Chrome mínimo original**: como único chrome de página se agregan dos botones
  pixel pequeños (audio on/off y salir) y una franja de título delgada.
- **Retoque de composición del mapa**: se permite reajustar posiciones en
  `plaza.ts` para mejorar la lectura de caminos y el espaciado.

## Enfoque de implementación

Se extrae el dibujo de cada elemento a un módulo de "decor builder" enfocado, en
lugar de inflar `PlazaScene`. `PlazaScene` queda como orquestador delgado; el
dibujo vive en helpers en `src/game/systems/`. Cada helper recibe datos del mapa
(`plaza.ts`) y dibuja un elemento. Esto respeta el principio de "contenido
separado de lógica" y mantiene cada pieza comprensible y editable de forma
aislada.

## Componentes

### 1. Estructura de página (`src/components/GameShell.tsx`, `src/app/globals.css`)

- Eliminar por completo la barra lateral (`game-sidebar` y sus tarjetas
  `Sesion / Controles / MVP`).
- El canvas pasa a ser el héroe: centrado, full-bleed, escalado pixel-perfect
  dentro de un marco pixel romántico de doble borde con el fondo nocturno y
  estrellas existente.
- Chrome original mínimo, sin imitar la barra inferior de referencia:
  - franja de título delgada arriba (ej. `La plaza de Naomi`);
  - dos botones pixel pequeños en una esquina: audio on/off y salir.
- Estado de carga conservado pero adaptado al nuevo layout (sin sidebar).
- Responsive: el marco se reduce con elegancia; en mobile el hint de controles
  vive dentro del HUD del canvas. Se actualizan los breakpoints que hoy asumen
  dos columnas (`.game-layout`).

### 2. Arte de la plaza (`src/game/systems/decor.ts` nuevo + `PlazaScene.ts`)

`decor.ts` expone funciones puras de dibujo, una por tipo de elemento. Reemplaza
el `renderDecor` monolítico actual.

- **Suelo (`renderGround`)**: césped nocturno de dos tonos con píxeles de detalle
  dispersos (briznas, piedritas, florecitas) para dar textura, en vez de cuadros
  planos.
- **Caminos**: empedrado en piedra fría clara con *tiles de borde* donde el camino
  toca el césped, más un anillo pavimentado alrededor de la fuente.
- **Fuente**: pileta de piedra en varios niveles, agua con brillo y un *shimmer*
  animado suave (tween), surtidor central y glow cálido. Es el centro claro de la
  escena. Lleva al lado un cartel de madera pequeño con texto traído de un archivo
  de datos (no hardcodeado).
- **Edificios**: siluetas reales — paredes sombreadas, techo a dos aguas con
  cumbrera, un cartel/marquesina con la etiqueta, ventanas con luz cálida y puerta
  con glow ámbar suave. Cada uno de los 4 edificios temáticos con su paleta.
- **Faroles**: poste + farol con glow radial aditivo suave y un charco de luz
  tenue en el suelo.
- **Árboles / flores / arbustos**: copas en capas con brillo y sombra; racimos de
  flores rosas/rojas/blancas.
- **Bancos y buzón**: más sombreado y detalle.
- **Ordenamiento por profundidad**: ordenar decor y jugador por Y (depth = y) para
  que el personaje pueda caminar *detrás* de árboles y edificios. Hoy todo es
  plano; esto es una mejora grande de realismo.
- **Atmósfera**: conservar el viñeteado nocturno; agregar partículas sutiles de
  luciérnagas/destellos y acumulación de luz cálida cerca de los faroles.

### 3. HUD y diálogo (`src/game/systems/dialogue.ts`, `src/game/systems/interactions.ts`, HUD de `PlazaScene`)

- Caja de diálogo y prompt de interacción reestilizados: borde pixel más limpio,
  placa de nombre y una animación suave de flotación en el prompt.
- HUD superior (nombre del jugador) con placa pixel coherente con el tono cálido.

### 4. Composición del mapa (`src/game/data/maps/plaza.ts`)

- Reajuste leve de posiciones: caminos que se lean como cruz/rombo limpio, fuente
  exactamente al centro, edificios enmarcando el perímetro con aire, y pasillos
  principales despejados (sin colisiones que bloqueen el paso).

## Datos / contenido

- Todo texto romántico vive en archivos de datos (`dialogues.ts`, y un nuevo campo
  o entrada para el cartel de la fuente). Se usan placeholders románticos
  marcados para que Guillermo los personalice. No se inventan recuerdos reales.

## Qué NO incluye (YAGNI)

- Sin assets PNG ni spritesheets externos.
- Sin interiores funcionales (los edificios siguen siendo decorativos con diálogo
  placeholder).
- Sin copiar la barra inferior ni el castillo de la imagen de referencia.
- Sin multiplayer, base de datos ni auth real.
- Rediseño de sprites de personaje: opcional y de baja prioridad; solo pequeños
  retoques de contorno/silueta si sobra tiempo, manteniéndolo procedural.

## Criterios de éxito

- La barra lateral desaparece; el juego se ve full-bleed y centrado.
- La plaza nocturna se lee como pixel art intencional (no bloques planos): caminos
  con bordes, fuente detallada, edificios con techo/cartel/ventanas iluminadas,
  faroles con glow, vegetación en capas.
- El personaje camina detrás de árboles/edificios (depth por Y).
- Diálogos, prompts y HUD coherentes con el tono romántico nocturno.
- Sin texto cortado ni solapamientos; pixel rendering nítido.
- `npm run lint` y `npm run build` pasan.

## Verificación

- Correr `npm run dev` y revisar `/game` con login `naomi/luna` y
  `guillermo/maia`.
- Capturar pantalla y comparar contra `images/example game.png` y el estado previo
  `images/current game.png`.
- `npm run lint` y `npm run build` en verde.
