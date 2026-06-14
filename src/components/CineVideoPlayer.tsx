"use client";

import { useEffect } from "react";
import { cineVideoConfig } from "@/game/data/cine";
import { setCineVideoOpen } from "@/game/ui-overlay-store";

export function CineVideoPlayer() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setCineVideoOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleExit() {
    setCineVideoOpen(false);
  }

  const embedUrl =
    `https://www.youtube.com/embed/${cineVideoConfig.youtubeId}` +
    `?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="cine-video-overlay" onClick={handleExit}>
      <button
        className="cine-video-close"
        onClick={handleExit}
        type="button"
        aria-label="Cerrar"
      >
        ✕
      </button>
      <div className="cine-video-container" onClick={(e) => e.stopPropagation()}>
        <div className="cine-video-wrapper">
          <iframe
            className="cine-video-player"
            src={embedUrl}
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Película"
          />
        </div>
      </div>
    </div>
  );
}
