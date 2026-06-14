"use client";

import { useEffect, useRef, useState } from "react";
import { GameOverlay } from "@/components/GameOverlay";
import type { Session } from "@/lib/session";
import { GAME_HEIGHT, GAME_WIDTH } from "@/game/config";

type PhaserGame = {
  destroy: (removeCanvas?: boolean) => void;
};

type CreateGame = (container: HTMLDivElement, session: Session) => PhaserGame;

type GameCanvasProps = {
  onReady?: () => void;
  session: Session;
};

function getCanvasDisplayScale(width: number, height: number) {
  const fitScale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);

  if (fitScale < 1) {
    return fitScale;
  }

  return Math.max(1, Math.floor(fitScale));
}

export function GameCanvas({ onReady, session }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReadyRef = useRef<GameCanvasProps["onReady"]>(onReady);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Cargando escena...");
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const updateDisplayScale = () => {
      setDisplayScale(getCanvasDisplayScale(window.innerWidth, window.innerHeight));
    };

    updateDisplayScale();
    window.addEventListener("resize", updateDisplayScale);

    return () => {
      window.removeEventListener("resize", updateDisplayScale);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let currentGame: PhaserGame | null = null;

    const bootGame = async () => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      setStatus("loading");
      setMessage("Cargando escena...");
      container.innerHTML = "";

      try {
        const gameModule = (await import("@/game/main")) as {
          createGame?: CreateGame;
        };

        if (!gameModule.createGame) {
          throw new Error("Missing createGame export");
        }

        if (cancelled) {
          return;
        }

        currentGame = gameModule.createGame(container, session);
        setStatus("ready");
        requestAnimationFrame(() => {
          if (!cancelled) {
            onReadyRef.current?.();
          }
        });
      } catch (error) {
        console.error("Game bootstrap failed", error);

        if (!cancelled) {
          setStatus("error");
          setMessage("La escena Phaser todavia no esta lista.");
        }
      }
    };

    void bootGame();

    return () => {
      cancelled = true;
      currentGame?.destroy(true);
      currentGame = null;
    };
  }, [session]);

  return (
    <div className="canvas-shell">
      <div
        className="game-stage"
        style={{
          width: `${GAME_WIDTH * displayScale}px`,
          height: `${GAME_HEIGHT * displayScale}px`,
        }}
      >
        <div className="canvas-root" ref={containerRef} />
        <GameOverlay displayScale={displayScale} />
        {status !== "ready" ? (
          <div className="loading-state canvas-loading-state">
            <div className="spinner" />
            <p className="hud-text">{message}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
