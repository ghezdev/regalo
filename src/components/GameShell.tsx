"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCanvas } from "@/components/GameCanvas";
import { clearSession, readSession, type Session } from "@/lib/session";

export function GameShell() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const storedSession = readSession();

    if (!storedSession) {
      router.replace("/");
      return;
    }

    setSession(storedSession);
    setIsReady(true);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/");
  };

  if (!isReady || !session) {
    return (
      <main className="game-screen">
        <div className="game-frame">
          <div className="game-stage-inner">
            <div className="loading-state">
              <div className="spinner" />
              <p className="hud-text">Buscando sesion local...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen">
      <div className="game-frame">
        <header className="game-topbar">
          <span className="game-title">La plaza de {session.displayName}</span>
          <div className="game-chrome">
            <button type="button" className="chrome-button" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
              {muted ? "Audio off" : "Audio on"}
            </button>
            <button type="button" className="chrome-button" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>
        <div className="game-stage-inner">
          <GameCanvas session={session} />
        </div>
      </div>
    </main>
  );
}
