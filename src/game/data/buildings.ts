import type { BuildingDefinition } from "../types/content";

export const buildings: BuildingDefinition[] = [
  {
    id: "dance-room",
    name: "Pista de baile",
    status: "future",
    interactionId: "dance-room-closed",
  },
  {
    id: "photo-room",
    name: "Habitacion de fotos",
    status: "future",
    interactionId: "photo-room-closed",
  },
  {
    id: "audio-calendar",
    name: "Calendario de audios",
    status: "future",
    interactionId: "audio-calendar-closed",
  },
  {
    id: "home",
    name: "Nuestra casa",
    status: "future",
    interactionId: "home-closed",
  },
  {
    id: "mailbox",
    name: "Buzon",
    status: "future",
    interactionId: "mailbox-placeholder",
  },
];
