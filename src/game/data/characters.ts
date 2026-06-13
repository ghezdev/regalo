import type { CharacterDefinition } from "../types/content";

export const characters: Record<string, CharacterDefinition> = {
  naomi: {
    id: "naomi",
    name: "Naomi",
    textureKey: "character-naomi",
    frameWidth: 50,
    frameHeight: 50,
    spawn: { x: 0, y: 0 },
  },
  guillermo: {
    id: "guillermo",
    name: "Guillermo",
    textureKey: "character-guillermo",
    frameWidth: 50,
    frameHeight: 50,
    spawn: { x: 0, y: 0 },
  },
};
