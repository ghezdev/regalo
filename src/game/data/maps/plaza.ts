import type { ImagePlazaMap } from "../../types/content";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../../config";

// All coordinates are world pixels (image is 2009×1273).
// Derived from pixel analysis of 'sprites/regalo naomi plaza LIMITES v3 RELLENADO.png'.
export const plazaMap: ImagePlazaMap = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,

  spawn: {
    naomi: { x: 1395, y: 380 },
    guillermo: { x: 1400, y: 1180 },
  },

  colliders: [
    // ── CASTLE PATH (vertical corridor, y=233-512) ─────────────────
    { x: 1327, y: 233, width: 143, height: 14 },   // top cap (castle door lintel)
    { x: 1327, y: 247, width: 16, height: 265 },   // left wall
    { x: 1453, y: 247, width: 16, height: 265 },   // right wall

    // ── CASTLE FUNNEL DIAGONAL (y=510-545) ─────────────────────────
    // Left edge: x=1343 at y=510 → jumps to x=1295 at y=515 → x=1273 at y=540
    { x: 1258, y: 508, width: 90, height: 14 },    // horizontal cap: covers the 1343→1295 jump
    { x: 1256, y: 520, width: 20, height: 32 },    // left wall of funnel (x=1256-1276, y=520-552)
    // Right edge: x=1497 at y=510 → x=1533 at y=545 (gradual step-right)
    { x: 1495, y: 510, width: 16, height: 9 },     // right step 1
    { x: 1503, y: 519, width: 16, height: 9 },     // right step 2
    { x: 1511, y: 528, width: 16, height: 9 },     // right step 3
    { x: 1519, y: 537, width: 20, height: 10 },    // right step 4

    // ── CORRIDOR NORTH WALL (y≈534, with entrance gaps) ────────────
    // Entrances: CASA DE LOS PENSAMIENTOS (x=299-366), DISCOTECA (x=417-437)
    { x: 277, y: 534, width: 22, height: 14 },     // far-left stub (x=277-299)
    { x: 365, y: 534, width: 54, height: 14 },     // wall between CASA and DISCOTECA
    { x: 437, y: 534, width: 840, height: 14 },    // main north wall (x=437-1277)

    // ── LEFT CORRIDOR ───────────────────────────────────────────────
    { x: 277, y: 548, width: 16, height: 122 },    // left wall (x=277-293, y=548-670)
    { x: 277, y: 668, width: 875, height: 14 },    // south wall (x=277-1152, blocking non-funnel)

    // ── FOUNTAIN (center of cross, blocks x=1325-1468, y=583-669) ──
    { x: 1325, y: 583, width: 145, height: 88 },   // fountain block

    // ── RIGHT CORRIDOR ──────────────────────────────────────────────
    { x: 1671, y: 534, width: 16, height: 148 },   // right wall
    { x: 1466, y: 668, width: 222, height: 14 },   // south wall

    // ── SOUTH FUNNEL (y=668-758, cross → lower path) ───────────────
    // Left diagonal: x=1143 at y=670 → big jump to x=1251 at y=680 → x=1349 at y=755
    { x: 1127, y: 668, width: 128, height: 16 },   // horizontal cap: covers 1143→1251 jump
    { x: 1237, y: 682, width: 16, height: 44 },    // left step y=682-726
    { x: 1253, y: 726, width: 16, height: 18 },    // left step y=726-744
    { x: 1269, y: 744, width: 16, height: 14 },    // left step y=744-758
    { x: 1285, y: 758, width: 66, height: 14 },    // horizontal connect to x=1349

    // Right diagonal: x=1544 at y=668 → x=1447 at y=755
    { x: 1545, y: 668, width: 142, height: 14 },   // south wall between right corridor and funnel
    { x: 1531, y: 682, width: 16, height: 20 },    // right step y=682-702
    { x: 1513, y: 702, width: 20, height: 20 },    // right step y=702-722 (steps left 18px)
    { x: 1461, y: 722, width: 56, height: 14 },    // horizontal cap for big left jump
    { x: 1447, y: 736, width: 16, height: 24 },    // right step y=736-760

    // ── LOWER WIDE SECTION (y=758-1018) ────────────────────────────
    { x: 1333, y: 758, width: 16, height: 262 },   // left wall
    { x: 1704, y: 758, width: 16, height: 262 },   // right wall

    // ── LOWER RIGHT TAPER (y=1018-1082, right edge steps inward) ───
    { x: 1692, y: 1018, width: 30, height: 16 },
    { x: 1672, y: 1034, width: 30, height: 16 },
    { x: 1650, y: 1050, width: 30, height: 16 },
    { x: 1626, y: 1066, width: 30, height: 16 },

    // ── SOUTH SPLIT (y=1082-1142, splits into left+right sub-paths) ─
    { x: 1506, y: 1080, width: 36, height: 64 },   // inner divider (x=1506-1542)
    { x: 1668, y: 1082, width: 22, height: 20 },   // right sub-path right wall step 1
    { x: 1646, y: 1100, width: 24, height: 20 },   // right sub-path right wall step 2
    { x: 1624, y: 1118, width: 24, height: 20 },   // right sub-path right wall step 3
    { x: 1539, y: 1136, width: 102, height: 14 },  // right sub-path south cap

    // ── CAMPSITE CORRIDOR (y=1142-1218) ─────────────────────────────
    { x: 1333, y: 1142, width: 18, height: 80 },   // left wall
    { x: 1451, y: 1142, width: 18, height: 80 },   // right wall

    // ── BOTTOM CAP ──────────────────────────────────────────────────
    { x: 1333, y: 1250, width: 138, height: 14 },  // bottom wall
  ],

  interactions: [
    {
      id: "castle-entrance",
      label: "E",
      targetName: "Entrada al castillo",
      x: 1348, y: 265, width: 105, height: 40,
      interactionId: "castle-entrance",
    },
    {
      id: "entrada-izq",
      label: "E",
      targetName: "Casa de los pensamientos",
      x: 293, y: 548, width: 60, height: 40,
      interactionId: "entrada-izq",
    },
    {
      id: "discoteca",
      label: "E",
      targetName: "Discoteca",
      x: 411, y: 548, width: 50, height: 40,
      interactionId: "discoteca",
    },
    {
      id: "entrada-der",
      label: "E",
      targetName: "Entrada derecha",
      x: 1648, y: 548, width: 40, height: 40,
      interactionId: "entrada-der",
    },
    {
      id: "zona-sur-der",
      label: "E",
      targetName: "Casa",
      x: 1648, y: 648, width: 40, height: 40,
      interactionId: "zona-sur-der",
    },
    {
      id: "fondo-sur",
      label: "E",
      targetName: "Campamento",
      x: 1348, y: 1230, width: 105, height: 30,
      interactionId: "fondo-sur",
    },
  ],
};
