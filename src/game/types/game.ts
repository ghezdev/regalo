export type CharacterId = "naomi" | "guillermo";

export interface GameSession {
  username: string;
  characterId: CharacterId;
  displayName: string;
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface WorldPoint {
  x: number;
  y: number;
}
