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

export type Direction = "up" | "down" | "left" | "right";

export interface PlayerUpdate {
  characterId: CharacterId;
  x: number;
  y: number;
  direction: Direction;
  moving: boolean;
  scene: string;
  floorMode?: boolean;
}
