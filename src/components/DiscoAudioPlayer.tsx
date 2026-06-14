"use client";

import { setDiscoAudioOpen } from "@/game/ui-overlay-store";

const YOUTUBE_VIDEO_ID = "BQAKKp6ziD0";
const YOUTUBE_PLAYLIST_ID = "PLYnM2juJgn7_EptxXypfE2SoRYKcfQvQB";
const EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&list=${YOUTUBE_PLAYLIST_ID}`;

export function DiscoAudioPlayer() {
  return (
    <>
      <iframe
        src={EMBED_URL}
        title="Discoteca playlist audio"
        allow="autoplay; encrypted-media"
        className="disco-audio-iframe"
      />
      <div className="disco-audio-card">
        <span className="disco-audio-card-title">Pista de baile</span>
        <button
          className="disco-audio-card-stop"
          onClick={() => setDiscoAudioOpen(false)}
          type="button"
        >
          Parar
        </button>
      </div>
    </>
  );
}