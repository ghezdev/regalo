import type { CharacterDefinition } from "../types/content";

export const characters: Record<string, CharacterDefinition> = {
  naomi: {
    id: "naomi",
    name: "Naomi",
    textureKey: "character-naomi",
    frameWidth: 16,
    frameHeight: 20,
    spawn: { x: 15, y: 16 },
  },
  guillermo: {
    id: "guillermo",
    name: "Guillermo",
    textureKey: "character-guillermo",
    frameWidth: 16,
    frameHeight: 20,
    spawn: { x: 16, y: 16 },
  },
};
