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

export interface AudioCalendarEntry {
  key: string;
  src: string;
  dateLabel: string;
  date: string;
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

export interface ImageMapCollider {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImagePlazaMap {
  width: number;
  height: number;
  spawn: Record<string, { x: number; y: number }>;
  colliders: ImageMapCollider[];
  interactions: MapInteraction[];
  storyZones?: PlazaStoryZones;
}

export interface ButtonDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoryZoneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteriorDefinition {
  id: string;
  bgKey: string;
  worldWidth: number;
  worldHeight: number;
  colliders: ImageMapCollider[];
  walkableZones?: ImageMapCollider[];
  exitZone: ImageMapCollider;
  buttons?: ButtonDefinition[];
  staticCamera?: boolean;
  storySpawns?: Record<string, { x: number; y: number }>;
  lunaRoamZones?: StoryZoneRect[];
}

export interface PlazaStoryZones {
  preSalida: StoryZoneRect;
  campStay: StoryZoneRect;
  campLeave: StoryZoneRect;
  campApproach: StoryZoneRect;
}
