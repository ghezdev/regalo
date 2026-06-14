import { plazaMap } from "../../game/data/maps/plaza";
import type { CharacterId, PlayerUpdate, WorldPoint } from "../../game/types/game";

const CHARACTER_LABELS: Record<CharacterId, string> = {
  naomi: "Naomi",
  guillermo: "Guille",
};

const INTERIOR_LABELS: Record<string, string> = {
  castillo: "castillo",
  "casa-pensamientos": "casa de los pensamientos",
  discoteca: "discoteca",
  cine: "cine",
  casa: "casa",
};

export const MAP_PRESENCE_TIMEOUT_MS = 15000;

export interface MapPlayerPresence {
  characterId: CharacterId;
  lastPlazaPosition: WorldPoint | null;
  currentScene: string | null;
  lastSeenAt: number | null;
}

export interface MapPresenceState {
  naomi: MapPlayerPresence;
  guillermo: MapPlayerPresence;
}

export interface MapMarker {
  x: number;
  y: number;
  text: string;
  connected: boolean;
}

function createCharacterPresence(characterId: CharacterId): MapPlayerPresence {
  return {
    characterId,
    lastPlazaPosition: null,
    currentScene: null,
    lastSeenAt: null,
  };
}

export function createInitialMapPresence(): MapPresenceState {
  return {
    naomi: createCharacterPresence("naomi"),
    guillermo: createCharacterPresence("guillermo"),
  };
}

export function projectWorldToMap(point: WorldPoint, mapWidth: number, mapHeight: number) {
  return {
    x: (point.x / plazaMap.width) * mapWidth,
    y: (point.y / plazaMap.height) * mapHeight,
  };
}

export function reducePlayerUpdate(
  state: MapPresenceState,
  update: PlayerUpdate,
  receivedAt: number,
): MapPresenceState {
  const current = state[update.characterId];
  const nextPosition =
    update.scene === "plaza"
      ? {
          x: update.x,
          y: update.y,
        }
      : update.plazaPosition ?? current.lastPlazaPosition;

  return {
    ...state,
    [update.characterId]: {
      ...current,
      currentScene: update.scene,
      lastSeenAt: receivedAt,
      lastPlazaPosition: nextPosition,
    },
  };
}

export function getInteriorLabel(scene: string | null) {
  if (!scene || scene === "plaza") {
    return null;
  }

  const interiorId = scene.startsWith("interior:") ? scene.slice("interior:".length) : scene;
  return INTERIOR_LABELS[interiorId] ?? interiorId;
}

export function getMapMarker(
  presence: MapPlayerPresence,
  mapWidth: number,
  mapHeight: number,
  now: number,
): MapMarker | null {
  if (!presence.lastPlazaPosition || !presence.lastSeenAt) {
    return null;
  }

  if (now - presence.lastSeenAt > MAP_PRESENCE_TIMEOUT_MS) {
    return {
      x: 0,
      y: 0,
      text: "",
      connected: false,
    };
  }

  const projected = projectWorldToMap(presence.lastPlazaPosition, mapWidth, mapHeight);
  const interiorLabel = getInteriorLabel(presence.currentScene);
  const suffix = interiorLabel ? ` · adentro de ${interiorLabel}` : "";

  return {
    x: projected.x,
    y: projected.y,
    text: `${CHARACTER_LABELS[presence.characterId]}${suffix}`,
    connected: true,
  };
}
