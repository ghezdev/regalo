import { describe, expect, it } from "vitest";
import { plazaMap } from "../../../game/data/maps/plaza";
import type { PlayerUpdate } from "../../../game/types/game";
import {
  createInitialMapPresence,
  getMapMarker,
  projectWorldToMap,
  reducePlayerUpdate,
} from "../model";

function buildUpdate(overrides: Partial<PlayerUpdate>): PlayerUpdate {
  return {
    characterId: "naomi",
    x: 100,
    y: 200,
    direction: "down",
    moving: false,
    scene: "plaza",
    ...overrides,
  };
}

describe("mapa model", () => {
  it("projects world coordinates into map coordinates proportionally", () => {
    expect(projectWorldToMap({ x: plazaMap.width / 2, y: plazaMap.height / 2 }, 400, 200)).toEqual({
      x: 200,
      y: 100,
    });
  });

  it("keeps the last plaza position when a player moves into an interior", () => {
    const initialState = createInitialMapPresence();
    const plazaState = reducePlayerUpdate(
      initialState,
      buildUpdate({ characterId: "naomi", x: 500, y: 700, scene: "plaza" }),
      1000,
    );

    const interiorState = reducePlayerUpdate(
      plazaState,
      buildUpdate({ characterId: "naomi", x: 50, y: 60, scene: "interior:cine" }),
      1500,
    );

    const marker = getMapMarker(interiorState.naomi, 400, 200, 5000);

    expect(marker).toMatchObject({
      x: expect.closeTo((500 / plazaMap.width) * 400, 5),
      y: expect.closeTo((700 / plazaMap.height) * 200, 5),
      text: "Naomi · adentro de cine",
      connected: true,
    });
  });

  it("uses the plaza anchor from realtime updates when the page opens mid-interior", () => {
    const state = reducePlayerUpdate(
      createInitialMapPresence(),
      buildUpdate({
        characterId: "naomi",
        scene: "interior:castillo",
        x: 40,
        y: 50,
        plazaPosition: { x: 1400, y: 285 },
      }),
      1200,
    );

    const marker = getMapMarker(state.naomi, 400, 200, 2000);

    expect(marker).toMatchObject({
      x: expect.closeTo((1400 / plazaMap.width) * 400, 5),
      y: expect.closeTo((285 / plazaMap.height) * 200, 5),
      text: "Naomi · adentro de castillo",
      connected: true,
    });
  });

  it("hides a marker when the player is stale", () => {
    const state = reducePlayerUpdate(
      createInitialMapPresence(),
      buildUpdate({ characterId: "guillermo", x: 900, y: 1000 }),
      1000,
    );

    expect(getMapMarker(state.guillermo, 400, 200, 20000)).toMatchObject({
      connected: false,
    });
  });
});
