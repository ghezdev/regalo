import type { DialogueEntry } from "../types/content";

export const dialogues: Record<string, DialogueEntry> = {
  "fountain-message": {
    id: "fountain-message",
    lines: [
      "La fuente brilla suave en medio de la plaza.",
      "Este lugar todavia esta creciendo, pero ya late como algo hecho para vos.",
    ],
  },
  "dance-room-closed": {
    id: "dance-room-closed",
    lines: [
      "La pista de baile esta cerrada por ahora.",
      "Pronto va a tener una cancion lista para una noche tranquila juntos.",
    ],
  },
  "photo-room-closed": {
    id: "photo-room-closed",
    lines: [
      "La habitacion de fotos esta en preparacion.",
      "Todavia faltan los marcos y las imagenes que van a llenar este lugar.",
    ],
  },
  "audio-calendar-closed": {
    id: "audio-calendar-closed",
    lines: [
      "Aca va a vivir el calendario de audios.",
      "Cada paso va a poder abrir una fecha distinta cuando ese rincón este listo.",
    ],
  },
  "home-closed": {
    id: "home-closed",
    lines: [
      "Nuestra casa todavia no abre sus luces.",
      "Por ahora solo deja ver una promesa calida desde afuera.",
    ],
  },
  "mailbox-placeholder": {
    id: "mailbox-placeholder",
    lines: [
      "El buzon espera su primera nota.",
      "Mas adelante va a servir para mandar mensajes dentro de este regalo.",
    ],
  },
  "castle-entrance": {
    id: "castle-entrance",
    lines: ["La entrada al castillo..."],
  },
  "entrada-izq": {
    id: "entrada-izq",
    lines: ["Entrada izquierda..."],
  },
  "discoteca": {
    id: "discoteca",
    lines: ["La discoteca..."],
  },
  "entrada-der": {
    id: "entrada-der",
    lines: ["Entrada derecha..."],
  },
  "zona-sur-der": {
    id: "zona-sur-der",
    lines: ["Zona sur-derecha..."],
  },
  "fondo-sur": {
    id: "fondo-sur",
    lines: ["El campamento..."],
  },
};

// PLACEHOLDER — Guillermo: personalizar este texto del cartel de la fuente.
export const plazaBanner = {
  title: "Para Naomi",
  subtitle: "Tu plaza de recuerdos",
};
