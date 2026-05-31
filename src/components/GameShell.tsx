"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCanvas } from "@/components/GameCanvas";
import { clearSession, readSession, type Session } from "@/lib/session";

export function GameShell() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

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
      <main className="screen">
        <section className="night-frame game-layout">
          <div className="game-stage">
            <div className="game-stage-inner">
              <div className="loading-state">
                <div className="spinner" />
                <p className="hud-text">Buscando sesion local...</p>
              </div>
            </div>
          </div>
          <aside className="game-sidebar">
            <div className="sidebar-card">
              <h2>Acceso</h2>
              <p>Validando la sesion antes de montar Phaser.</p>
            </div>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="game-layout">
      <section className="game-stage">
        <div className="game-stage-inner">
          <GameCanvas session={session} />
        </div>
      </section>

      <aside className="game-sidebar">
        <div className="sidebar-card">
          <div className="session-row">
            <h2>Sesion</h2>
            <span className="session-chip">{session.characterId}</span>
          </div>
          <p>{session.displayName} entro a la plaza nocturna.</p>
          <p className="hud-text">Usuario: {session.username}</p>
          <div className="logout-wrap">
            <button
              className="pixel-ghost tiny-button"
              type="button"
              onClick={handleLogout}
            >
              Borrar sesion
            </button>
          </div>
        </div>

        <div className="sidebar-card">
          <h2>Controles</h2>
          <p>Movimiento con WASD o flechas. Interaccion reservada para E o Enter.</p>
        </div>

        <div className="sidebar-card">
          <h2>MVP</h2>
          <p>Canvas cliente listo para montar la plaza, dialogos y musica placeholder.</p>
        </div>
      </aside>
    </main>
  );
}
