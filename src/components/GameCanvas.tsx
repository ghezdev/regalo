"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@/lib/session";

type PhaserGame = {
  destroy: (removeCanvas?: boolean) => void;
};

type CreateGame = (container: HTMLDivElement, session: Session) => PhaserGame;

type GameCanvasProps = {
  session: Session;
};

export function GameCanvas({ session }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Cargando escena...");

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
      <div className="canvas-root" ref={containerRef} />
        {status !== "ready" ? (
          <div className="loading-state canvas-loading-state">
            <div className="spinner" />
            <p className="hud-text">{message}</p>
          </div>
        ) : null}
    </div>
  );
}
