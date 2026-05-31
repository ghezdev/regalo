import type { MusicTrackDefinition } from "../types/content";

export const musicTracks: Record<string, MusicTrackDefinition> = {
  plazaNight: {
    id: "plaza-night",
    title: "Plaza de noche",
    src: "/assets/audio/plaza-night-placeholder.mp3",
    loop: true,
    volume: 0.35,
  },
};
