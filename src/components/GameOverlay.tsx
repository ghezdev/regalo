"use client";

import { useSyncExternalStore } from "react";
import {
  getGameOverlayState,
  subscribeToGameOverlay,
} from "@/game/ui-overlay-store";
import { DiscoAudioPlayer } from "./DiscoAudioPlayer";
import { CineVideoPlayer } from "./CineVideoPlayer";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type GameOverlayProps = {
  displayScale: number;
};

export function GameOverlay({ displayScale }: GameOverlayProps) {
  const overlay = useSyncExternalStore(
    subscribeToGameOverlay,
    getGameOverlayState,
    getGameOverlayState,
  );

  return (
    <div className="game-overlay">
      {overlay.hud.movementHint ? (
        <div className="game-hud-card">
          <p className="game-hud-text">{overlay.hud.movementHint}</p>
        </div>
      ) : null}

      {overlay.activeAudioLabel ? (
        <div
          className="audio-date-label"
          style={{
            left: `${overlay.activeAudioLabel.x * displayScale}px`,
            top: `${overlay.activeAudioLabel.y * displayScale}px`,
          }}
        >
          <span>{overlay.activeAudioLabel.text}</span>
          <div className="audio-progress-container">
            <div className="audio-progress-track">
              <div
                className="audio-progress-fill"
                style={{
                  width: `${
                    overlay.activeAudioLabel.duration > 0
                      ? Math.min(
                          100,
                          (overlay.activeAudioLabel.elapsed /
                            overlay.activeAudioLabel.duration) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="audio-progress-row">
            <span className="audio-progress-time">
              {formatTime(overlay.activeAudioLabel.elapsed)}
            </span>
            <span className="audio-progress-time">
              {formatTime(overlay.activeAudioLabel.duration)}
            </span>
          </div>
        </div>
      ) : null}

      {overlay.labels.map((label) =>
        label.visible ? (
          <div
            className={`world-label ${label.active ? "is-active" : ""}`}
            key={label.id}
            style={{
              left: `${label.x * displayScale}px`,
              top: `${label.y * displayScale}px`,
            }}
          >
            <span>{label.text}</span>
            {label.active ? <b className="world-label-key">E</b> : null}
          </div>
        ) : null,
      )}

      {overlay.dialogue.visible ? (
        <div className="dialogue-overlay">
          <div className="dialogue-overlay-title">{overlay.dialogue.title}</div>
          <p className="dialogue-overlay-body">{overlay.dialogue.body}</p>
          <div className="dialogue-overlay-hint">{overlay.dialogue.hint}</div>
        </div>
      ) : null}

      {overlay.discoAudioOpen ? <DiscoAudioPlayer /> : null}

      {overlay.cineVideoOpen ? <CineVideoPlayer /> : null}

      {overlay.endingBlackoutVisible ? <div className="ending-blackout" /> : null}
    </div>
  );
}
