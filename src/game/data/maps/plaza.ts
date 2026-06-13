import type { ImagePlazaMap } from "../../types/content";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../../config";

// All coordinates are world pixels (image is 2009×1273).
// Collider values are initial approximations — calibrate by running the game.
export const plazaMap: ImagePlazaMap = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,

  spawn: {
    naomi: { x: 1420, y: 350 },
    guillermo: { x: 1400, y: 1180 },
  },

  // Thin wall rectangles tracing the white boundary from LIMITES v2.png.
  colliders: [
    // ── Horizontal path ──────────────────────────────
    { x: 293,  y: 531,  width: 10,  height: 170 }, // left cap
    { x: 303,  y: 531,  width: 1052, height: 10 }, // top wall (up to upper-right path)
    { x: 293,  y: 691,  width: 970, height: 10  }, // bottom wall
    // ── Upper-right path (to castle) ─────────────────
    { x: 1355, y: 253,  width: 82,  height: 10  }, // top cap
    { x: 1355, y: 263,  width: 10,  height: 278 }, // left wall
    { x: 1437, y: 263,  width: 10,  height: 278 }, // right wall
    // ── Right building zone ───────────────────────────
    { x: 1129, y: 253,  width: 226, height: 10  }, // top-left of right zone
    { x: 1585, y: 253,  width: 74,  height: 10  }, // top-right of right zone
    { x: 1649, y: 263,  width: 10,  height: 300 }, // far-right wall
    // ── Right connector (x:1526-1669, y:552-700) ─────
    { x: 1526, y: 552,  width: 143, height: 10  }, // top
    { x: 1659, y: 552,  width: 10,  height: 148 }, // right wall
    // ── Lower section left wall ───────────────────────
    { x: 1353, y: 700,  width: 10,  height: 572 }, // left wall going down
    // ── Top connector of lower section ───────────────
    { x: 1434, y: 698,  width: 10,  height: 84  }, // left side
    { x: 1623, y: 698,  width: 10,  height: 84  }, // right side
    { x: 1434, y: 782,  width: 199, height: 10  }, // bottom of connector
    // ── Right wall of lower section (diagonal approx) ─
    { x: 1572, y: 776,  width: 135, height: 10  }, // top
    { x: 1697, y: 786,  width: 10,  height: 350 }, // right wall
    { x: 1572, y: 1136, width: 135, height: 10  }, // bottom
    // ── South / campsite section ──────────────────────
    { x: 1440, y: 1073, width: 137, height: 10  }, // top
    { x: 1440, y: 1083, width: 10,  height: 188 }, // left wall
    { x: 1567, y: 1083, width: 10,  height: 188 }, // right wall
    { x: 1440, y: 1261, width: 137, height: 10  }, // bottom
    // ── Small fragment (right area) ───────────────────
    { x: 1631, y: 771,  width: 29,  height: 7   },
  ],

  interactions: [
    {
      id: "castle-entrance",
      label: "E",
      targetName: "Entrada al castillo",
      x: 1380, y: 340, width: 80, height: 40,
      interactionId: "castle-entrance",
    },
    {
      id: "entrada-izq",
      label: "E",
      targetName: "Entrada izquierda",
      x: 370, y: 545, width: 45, height: 30,
      interactionId: "entrada-izq",
    },
    {
      id: "discoteca",
      label: "E",
      targetName: "Discoteca",
      x: 1120, y: 550, width: 50, height: 30,
      interactionId: "discoteca",
    },
    {
      id: "entrada-der",
      label: "E",
      targetName: "Entrada derecha",
      x: 1630, y: 545, width: 45, height: 30,
      interactionId: "entrada-der",
    },
    {
      id: "zona-sur-der",
      label: "E",
      targetName: "Zona sur-derecha",
      x: 1620, y: 775, width: 50, height: 30,
      interactionId: "zona-sur-der",
    },
    {
      id: "fondo-sur",
      label: "E",
      targetName: "Campamento",
      x: 1360, y: 1245, width: 80, height: 30,
      interactionId: "fondo-sur",
    },
  ],
};
