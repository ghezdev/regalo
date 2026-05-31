# Roadmap Y Backlog

## Fase 0: Documentacion

Estado: completa.

Objetivo:

- documentar vision;
- definir stack;
- definir MVP;
- definir arquitectura;
- dejar reglas para agentes.

## Fase 1: Base Del Proyecto

Estado: completa.

Objetivo:

- crear app Next.js con TypeScript;
- configurar estilos globales;
- instalar Phaser;
- crear rutas `/` y `/game`;
- crear estructura de carpetas;
- cargar Phaser en cliente sin errores SSR.

Tareas:

- inicializar proyecto;
- configurar ESLint/TypeScript;
- crear `LoginScreen`;
- crear `GameCanvas`;
- crear `createGame`;
- validar build local.

## Fase 2: Login Simple

Estado: completa.

Objetivo:

- permitir acceso a Naomi y Guillermo;
- determinar personaje automaticamente.

Tareas:

- crear `src/game/data/users.ts`;
- validar `naomi/luna`;
- validar `guillermo/maia`;
- guardar sesion en `localStorage`;
- redirigir a `/game`;
- proteger `/game` de usuarios sin sesion local;
- agregar logout oculto o boton pequeno de salida.

## Fase 3: Plaza Jugable

Estado: primera version completa; pendiente pulido visual iterativo.

Objetivo:

- crear la primera version jugable de la plaza.

Tareas:

- crear `PlazaScene`;
- definir mapa en TypeScript;
- agregar tiles placeholder;
- agregar suelo, caminos, flores, rosas, faroles, fuente y edificios;
- agregar colisiones;
- agregar spawn por personaje;
- agregar camara.

## Fase 4: Personajes

Estado: placeholders completos; pendiente arte final/personalizado.

Objetivo:

- tener dos personajes definidos y distinguibles.

Tareas:

- crear sprites placeholder;
- definir animaciones idle;
- definir animaciones caminar en cuatro direcciones;
- asignar personaje por usuario;
- ajustar escala pixel-perfect.

## Fase 5: Interacciones Y Dialogos

Estado: primera version completa.

Objetivo:

- permitir que el mapa tenga detalles interactivos.

Tareas:

- implementar detector de zona cercana;
- tecla `E` para interactuar;
- caja de dialogo pixel art;
- dialogo de fuente central;
- dialogos placeholder de edificios cerrados;
- indicador visual sutil cuando se puede interactuar.

## Fase 6: Audio

Estado: estructura y toggle completos; pendiente asset musical real.

Objetivo:

- agregar musica ambiente linda, nostalgica y romantica.

Tareas:

- agregar archivo placeholder en `public/assets/audio`;
- boton de activar/desactivar sonido;
- volumen configurable;
- fade in/fade out;
- evitar autoplay bloqueado por navegador.

## Fase 7: Pulido Visual

Estado: en progreso.

Objetivo:

- que el MVP se sienta intencional y no como prototipo.

Tareas:

- mejorar paleta nocturna;
- agregar luces calidas;
- agregar detalles florales;
- ajustar composicion del mapa;
- revisar espacios caminables;
- revisar mobile;
- revisar desktop;
- evitar textos solapados;
- validar pixel rendering.

## Fase 8: Deploy

Objetivo:

- publicar en Vercel.

Tareas:

- configurar repo en Vercel;
- validar build;
- probar login;
- probar ruta directa `/game`;
- probar assets;
- probar audio;
- documentar URL final.

## Backlog Futuro

### Buzon Con Email

- crear modal de escritura;
- crear API route `/api/send-note`;
- integrar Resend;
- configurar variables de entorno;
- enviar email a Guillermo;
- mostrar estado de envio.

### Habitacion De Fotos

- crear interior;
- agregar marcos;
- cargar fotos reales;
- abrir modal de foto;
- agregar textos por foto.

### Pista De Baile

- crear interior;
- agregar piso animado;
- agregar reproductor via overlay React;
- permitir links de YouTube definidos en datos;
- agregar animaciones de baile.

### Calendario De Audios

- crear interior tipo calendario;
- mapear dias a audios;
- reproducir audio al interactuar;
- agregar textos o fechas.

### Nuestra Casa

- crear interior hogareno;
- agregar gato blanco con manchas naranjas, marrones y negras;
- agregar gato naranja;
- agregar animaciones de gatos;
- agregar interacciones pequenas.
