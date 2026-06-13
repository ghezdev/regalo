import type { InteriorDefinition } from "../../types/content";

export const interiors: Record<string, InteriorDefinition> = {
  castillo: {
    id: "castillo",
    bgKey: "bg-castillo",
    worldWidth: 1916,
    worldHeight: 821,
    colliders: [],
    // Línea amarilla al extremo derecho del corredor largo
    exitZone: { x: 1680, y: 300, width: 110, height: 45 },
  },

  "casa-pensamientos": {
    id: "casa-pensamientos",
    bgKey: "bg-casa-pensamientos",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    // Línea amarilla al centro-bajo de la sala
    exitZone: { x: 585, y: 1010, width: 170, height: 50 },
    buttons: [
      // 7 columnas × 5 filas — posiciones estimadas desde imagen de referencia, refinar con physics debug
      // Fila 0 (y≈293)
      { id: "btn-r0-c0", x: 288, y: 263, width: 60, height: 60 },
      { id: "btn-r0-c1", x: 433, y: 263, width: 60, height: 60 },
      { id: "btn-r0-c2", x: 578, y: 263, width: 60, height: 60 },
      { id: "btn-r0-c3", x: 723, y: 263, width: 60, height: 60 },
      { id: "btn-r0-c4", x: 868, y: 263, width: 60, height: 60 },
      { id: "btn-r0-c5", x: 1013, y: 263, width: 60, height: 60 },
      { id: "btn-r0-c6", x: 1158, y: 263, width: 60, height: 60 },
      // Fila 1 (y≈448)
      { id: "btn-r1-c0", x: 288, y: 418, width: 60, height: 60 },
      { id: "btn-r1-c1", x: 433, y: 418, width: 60, height: 60 },
      { id: "btn-r1-c2", x: 578, y: 418, width: 60, height: 60 },
      { id: "btn-r1-c3", x: 723, y: 418, width: 60, height: 60 },
      { id: "btn-r1-c4", x: 868, y: 418, width: 60, height: 60 },
      { id: "btn-r1-c5", x: 1013, y: 418, width: 60, height: 60 },
      { id: "btn-r1-c6", x: 1158, y: 418, width: 60, height: 60 },
      // Fila 2 (y≈603)
      { id: "btn-r2-c0", x: 288, y: 573, width: 60, height: 60 },
      { id: "btn-r2-c1", x: 433, y: 573, width: 60, height: 60 },
      { id: "btn-r2-c2", x: 578, y: 573, width: 60, height: 60 },
      { id: "btn-r2-c3", x: 723, y: 573, width: 60, height: 60 },
      { id: "btn-r2-c4", x: 868, y: 573, width: 60, height: 60 },
      { id: "btn-r2-c5", x: 1013, y: 573, width: 60, height: 60 },
      { id: "btn-r2-c6", x: 1158, y: 573, width: 60, height: 60 },
      // Fila 3 (y≈758)
      { id: "btn-r3-c0", x: 288, y: 728, width: 60, height: 60 },
      { id: "btn-r3-c1", x: 433, y: 728, width: 60, height: 60 },
      { id: "btn-r3-c2", x: 578, y: 728, width: 60, height: 60 },
      { id: "btn-r3-c3", x: 723, y: 728, width: 60, height: 60 },
      { id: "btn-r3-c4", x: 868, y: 728, width: 60, height: 60 },
      { id: "btn-r3-c5", x: 1013, y: 728, width: 60, height: 60 },
      { id: "btn-r3-c6", x: 1158, y: 728, width: 60, height: 60 },
      // Fila 4 (y≈913)
      { id: "btn-r4-c0", x: 288, y: 883, width: 60, height: 60 },
      { id: "btn-r4-c1", x: 433, y: 883, width: 60, height: 60 },
      { id: "btn-r4-c2", x: 578, y: 883, width: 60, height: 60 },
      { id: "btn-r4-c3", x: 723, y: 883, width: 60, height: 60 },
      { id: "btn-r4-c4", x: 868, y: 883, width: 60, height: 60 },
      { id: "btn-r4-c5", x: 1013, y: 883, width: 60, height: 60 },
      { id: "btn-r4-c6", x: 1158, y: 883, width: 60, height: 60 },
    ],
  },

  discoteca: {
    id: "discoteca",
    bgKey: "bg-discoteca",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    // Línea amarilla al centro-bajo de la pista
    exitZone: { x: 555, y: 1000, width: 180, height: 50 },
  },

  casa: {
    id: "casa",
    bgKey: "bg-casa",
    worldWidth: 1950,
    worldHeight: 1300,
    colliders: [],
    // Línea amarilla al centro-bajo del segundo piso
    exitZone: { x: 690, y: 1215, width: 150, height: 55 },
  },
};
