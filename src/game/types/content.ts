import type { CharacterId, GridPoint } from "./game";

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  textureKey: string;
  frameWidth: number;
  frameHeight: number;
  spawn: GridPoint;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  status: "future" | "closed";
  interactionId: string;
}

export interface DialogueEntry {
  id: string;
  lines: string[];
}

export interface MusicTrackDefinition {
  id: string;
  title: string;
  src: string;
  loop: boolean;
  volume: number;
}

export interface MapInteraction {
  id: string;
  label: string;
  targetName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactionId: string;
}

export interface MapRectObject {
  id: string;
  kind:
    | "fountain"
    | "building"
    | "bench"
    | "flower-bed"
    | "lamp"
    | "tree"
    | "mailbox";
  x: number;
  y: number;
  width: number;
  height: number;
  solid?: boolean;
  variant?: string;
  label?: string;
}

export interface PlazaMapDefinition {
  id: string;
  tileSize: number;
  width: number;
  height: number;
  spawn: Record<CharacterId, GridPoint>;
  paths: GridPoint[];
  flowerBeds: GridPoint[];
  lamps: GridPoint[];
  trees: GridPoint[];
  benches: GridPoint[];
  objects: MapRectObject[];
  interactions: MapInteraction[];
}
