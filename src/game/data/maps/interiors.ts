import type { InteriorDefinition } from "../../types/content";

export const interiors: Record<string, InteriorDefinition> = {
  castillo: {
    id: "castillo",
    bgKey: "bg-castillo",
    worldWidth: 1916,
    worldHeight: 821,
    colliders: [],
    exitZone: { x: 808, y: 720, width: 300, height: 40 },
  },

  "casa-pensamientos": {
    id: "casa-pensamientos",
    bgKey: "bg-casa-pensamientos",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    exitZone: { x: 524, y: 960, width: 400, height: 40 },
    buttons: [],
  },

  discoteca: {
    id: "discoteca",
    bgKey: "bg-discoteca",
    worldWidth: 1448,
    worldHeight: 1086,
    colliders: [],
    exitZone: { x: 524, y: 960, width: 400, height: 40 },
  },

  casa: {
    id: "casa",
    bgKey: "bg-casa",
    worldWidth: 1950,
    worldHeight: 1300,
    colliders: [],
    exitZone: { x: 775, y: 1160, width: 400, height: 40 },
  },
};
