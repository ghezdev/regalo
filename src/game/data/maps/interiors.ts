import type { InteriorDefinition } from "../../types/content";

function createButtonGrid(
  startX: number,
  startY: number,
  columns: number,
  rows: number,
  gapX: number,
  gapY: number,
  buttonSize: number,
) {
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;

    return {
      id: `btn-r${row}-c${column}`,
      x: startX + column * gapX,
      y: startY + row * gapY,
      width: buttonSize,
      height: buttonSize,
    };
  });
}

export const interiors: Record<string, InteriorDefinition> = {
  castillo: {
    id: "castillo",
    bgKey: "bg-castillo",
    worldWidth: 1916,
    worldHeight: 821,
    colliders: [],
    walkableZones: [
      // Habitación izquierda (dormitorio con cama y peluches)
      { x: 140, y: 337, width: 239, height: 231 },
      // Corredor principal largo
      { x: 379, y: 362, width: 1494, height: 205 },
    ],
    exitZone: { x: 1750, y: 381, width: 79, height: 37 },
    storySpawns: {
      "castle-intro": { x: 220, y: 410 },
      "castle-exit": { x: 1789, y: 399 },
    },
  },

  "casa-pensamientos": {
    id: "casa-pensamientos",
    bgKey: "bg-casa-pensamientos",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    walkableZones: [
      { x: 232, y: 326, width: 976, height: 477 },
      { x: 231, y: 803, width: 415, height: 78 },
      { x: 792, y: 803, width: 416, height: 78 },
      { x: 645, y: 803, width: 147, height: 260 },
    ],
    // Línea amarilla al centro-bajo de la sala
    exitZone: { x: 585, y: 1010, width: 170, height: 50 },
    // Grilla más compacta y centrada dentro de la sala
    buttons: createButtonGrid(298, 345, 7, 5, 132, 84, 60),
  },

  discoteca: {
    id: "discoteca",
    bgKey: "bg-discoteca",
    worldWidth: 1448,
    worldHeight: 1086,
    staticCamera: true,
    colliders: [],
    walkableZones: [
      { x: 572, y: 363, width: 595, height: 393 },
      { x: 194, y: 551, width: 397, height: 110 },
      { x: 235, y: 660, width: 295, height: 210 },
      { x: 1030, y: 719, width: 137, height: 151 },
      { x: 597, y: 756, width: 178, height: 282 },
    ],
    // Línea amarilla al centro-bajo de la pista
    exitZone: { x: 555, y: 1000, width: 180, height: 50 },
  },

  cine: {
    id: "cine",
    bgKey: "bg-cine",
    worldWidth: 1254,
    worldHeight: 1254,
    staticCamera: true,
    colliders: [],
    walkableZones: [
      // Pasillo frontal (frente a la pantalla)
      { x: 359, y: 113, width: 497, height: 157 },
      // Pasillo central conector (entre frontal y butacas)
      { x: 553, y: 270, width: 147, height: 50 },
      // Zona de butacas: pasillos laterales y centro
      { x: 246, y: 319, width: 740, height: 392 },
      // Corredor al lobby
      { x: 553, y: 711, width: 147, height: 474 },
    ],
    // Línea amarilla al centro-bajo del lobby
    exitZone: { x: 573, y: 1114, width: 111, height: 56 },
  },

  casa: {
    id: "casa",
    bgKey: "bg-casa",
    worldWidth: 1950,
    worldHeight: 1300,
    staticCamera: true,
    colliders: [],
    walkableZones: [
      // Piso superior - sala izquierda (dormitorio/living)
      { x: 428, y: 78,   width: 467, height: 350 },
      // Piso superior - sala derecha (dormitorio/cocina)
      { x: 895, y: 78,   width: 496, height: 350 },
      // Corredor central vertical (escalera entre pisos)
      { x: 774, y: 428,  width: 121, height: 275 },
      // Balcón inferior derecho
      { x: 895, y: 600,  width: 424, height: 103 },
      // Pasillo estrecho descendiente
      { x: 934, y: 703,  width: 116, height: 202 },
      // Piso inferior - sala principal
      { x: 585, y: 905,  width: 767, height: 180 },
      // Piso inferior - sección derecha
      { x: 877, y: 1085, width: 475, height: 130 },
      // Corredor de salida
      { x: 979, y: 1215, width: 114, height: 50  },
    ],
    exitZone: { x: 988, y: 1215, width: 97, height: 40 },
    lunaRoamZones: [
      { x: 450, y: 100, width: 200, height: 150 },
      { x: 700, y: 120, width: 180, height: 120 },
      { x: 930, y: 100, width: 200, height: 150 },
    ],
  },
};
