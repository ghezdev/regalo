"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCanvas } from "@/components/GameCanvas";
import { readSession, type Session } from "@/lib/session";
import {
  LOGIN_TRANSITION_STORAGE_KEY,
  LOGIN_TRANSITION_STORAGE_VALUE,
} from "@/game/data/ui";

const REVEAL_DURATION_MS = 1800;

export function GameShell() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [shouldReveal, setShouldReveal] = useState(false);
  const [isRevealFading, setIsRevealFading] = useState(false);
  const [isRevealVisible, setIsRevealVisible] = useState(false);

  useEffect(() => {
    const storedSession = readSession();

    if (!storedSession) {
      router.replace("/");
      return;
    }

    const transitionMarker = window.sessionStorage.getItem(LOGIN_TRANSITION_STORAGE_KEY);
    if (transitionMarker === LOGIN_TRANSITION_STORAGE_VALUE) {
      setShouldReveal(true);
      setIsRevealVisible(true);
      window.sessionStorage.removeItem(LOGIN_TRANSITION_STORAGE_KEY);
    }

    setSession(storedSession);
    setIsReady(true);
  }, [router]);

  useEffect(() => {
    if (!isRevealVisible || !isRevealFading) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsRevealVisible(false);
      setIsRevealFading(false);
      setShouldReveal(false);
    }, REVEAL_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isRevealFading, isRevealVisible]);

  if (!isReady || !session) {
    return <main className="game-screen" />;
  }

  return (
    <main className="game-screen">
      <GameCanvas
        onReady={() => {
          if (!shouldReveal) {
            return;
          }

          requestAnimationFrame(() => {
            setIsRevealFading(true);
          });
        }}
        session={session}
      />
      {isRevealVisible ? (
        <div className={`game-reveal ${isRevealFading ? "is-fading" : ""}`} />
      ) : null}
    </main>
  );
}
