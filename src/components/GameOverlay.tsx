"use client";

import { useSyncExternalStore } from "react";
import {
  getGameOverlayState,
  subscribeToGameOverlay,
} from "@/game/ui-overlay-store";
import { CineSlideshowOverlay } from "./CineSlideshowOverlay";
import { DiscoAudioPlayer } from "./DiscoAudioPlayer";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "--:--";
  }

  const safeSeconds = Math.floor(seconds);
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getProgressWidth(elapsed: number, duration: number): string {
  if (!Number.isFinite(elapsed) || !Number.isFinite(duration) || duration <= 0) {
    return "0%";
  }

  const progress = (elapsed / duration) * 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return `${clampedProgress}%`;
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
                  width: getProgressWidth(
                    overlay.activeAudioLabel.elapsed,
                    overlay.activeAudioLabel.duration,
                  ),
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

      {overlay.cineVideoOpen ? <CineSlideshowOverlay /> : null}

      {overlay.endingBlackoutVisible ? <div className="ending-blackout" /> : null}
    </div>
  );
}
