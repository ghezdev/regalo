"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCanvas } from "@/components/GameCanvas";
import { readSession, type Session } from "@/lib/session";

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

  if (!isReady || !session) {
    return (
      <main className="game-screen">
        <div className="loading-state">
          <div className="spinner" />
          <p className="hud-text">Buscando sesion local...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen">
      <button
        type="button"
        className="audio-fab"
        onClick={() => setMuted((m) => !m)}
        aria-pressed={muted}
        aria-label={muted ? "Activar audio" : "Silenciar audio"}
      >
        {muted ? "[ off ]" : "[ on ]"}
      </button>
      <GameCanvas session={session} />
    </main>
  );
}
