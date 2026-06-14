"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser, persistSession, readSession } from "@/lib/session";
import {
  loginUi,
  LOGIN_TRANSITION_STORAGE_KEY,
  LOGIN_TRANSITION_STORAGE_VALUE,
} from "@/game/data/ui";

type LoginMode =
  | "intro"
  | "username"
  | "password"
  | "transitioning";

type DisplayLine = {
  text: string;
  tone: "muted" | "active" | "error";
};

const INTRO_TYPING_MS = 34;
const INTRO_PAUSE_MS = 520;
const LINE_LIFT_PX = 44;
const TRANSITION_DELAY_MS = 260;

export function LoginScreen() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const introTimersRef = useRef<number[]>([]);
  const [mode, setMode] = useState<LoginMode>("intro");
  const [completedLines, setCompletedLines] = useState<DisplayLine[]>([]);
  const [activeInput, setActiveInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const session = readSession();

    if (session) {
      router.replace("/game");
    }
  }, [router]);

  useEffect(() => {
    if (mode !== "intro") {
      return;
    }

    if (loginUi.introLines.length === 0) {
      setMode("username");
      return;
    }

    const timers: number[] = [];
    let elapsed = 0;

    loginUi.introLines.forEach((line, index) => {
      const startAt = elapsed;
      const finishAt = startAt + line.length * INTRO_TYPING_MS + INTRO_PAUSE_MS;

      timers.push(
        window.setTimeout(() => {
          setCompletedLines((current) => [...current, { text: line, tone: "muted" }]);

          if (index === loginUi.introLines.length - 1) {
            setMode("username");
          }
        }, finishAt),
      );

      elapsed = finishAt;
    });

    introTimersRef.current = timers;

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "username" || mode === "password") {
      inputRef.current?.focus();
    }
  }, [mode]);

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus();
    };

    window.addEventListener("pointerdown", focusInput);

    return () => {
      window.removeEventListener("pointerdown", focusInput);
    };
  }, []);

  const activeLine = useMemo(() => {
    if (mode === "username") {
      return `${loginUi.usernamePrompt}: ${activeInput}`;
    }

    if (mode === "password") {
      return `${loginUi.passwordPrompt}: ${"•".repeat(activeInput.length)}`;
    }

    return "";
  }, [activeInput, mode]);

  const handleUsernameConfirm = () => {
    const normalized = activeInput.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    setCompletedLines((current) => [
      ...current,
      { text: `${loginUi.usernamePrompt}: ${normalized}`, tone: "active" },
    ]);
    setActiveInput("");
    setErrorMessage("");
    setMode("password");
  };

  const handlePasswordConfirm = () => {
    const normalizedPassword = activeInput.trim().toLowerCase();

    if (!normalizedPassword) {
      return;
    }

    const usernameLine = completedLines.findLast((line) =>
      line.text.startsWith(`${loginUi.usernamePrompt}: `),
    );
    const username = usernameLine
      ? usernameLine.text.replace(`${loginUi.usernamePrompt}: `, "").trim()
      : "";

    setCompletedLines((current) => [
      ...current,
      {
        text: `${loginUi.passwordPrompt}: ${"•".repeat(normalizedPassword.length)}`,
        tone: "active",
      },
    ]);

    const session = authenticateUser(username, normalizedPassword);

    if (!session) {
      setActiveInput("");
      setErrorMessage(loginUi.invalidMessage);
      setCompletedLines(
        loginUi.introLines.map((line) => ({ text: line, tone: "muted" as const })),
      );
      setMode("username");
      return;
    }

    persistSession(session);
    window.sessionStorage.setItem(
      LOGIN_TRANSITION_STORAGE_KEY,
      LOGIN_TRANSITION_STORAGE_VALUE,
    );
    setActiveInput("");
    setErrorMessage("");
    setMode("transitioning");

    window.setTimeout(() => {
      router.push("/game");
    }, TRANSITION_DELAY_MS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (mode === "username") {
      handleUsernameConfirm();
      return;
    }

    if (mode === "password") {
      handlePasswordConfirm();
    }
  };

  const wrapperTransform = `translate(-50%, calc(-50% - ${
    completedLines.length * LINE_LIFT_PX
  }px))`;

  return (
    <main className={`login-screen ${mode === "transitioning" ? "is-transitioning" : ""}`}>
      <div className="login-transition-target" aria-hidden="true" />
      <div className="login-screen-overlay" aria-hidden="true" />

      <section className="login-stage" aria-label="Ingreso al regalo">
        <div className="login-script" style={{ transform: wrapperTransform }}>
          {completedLines.map((line, index) => (
            <p
              className={`login-line is-${line.tone}`}
              key={`${line.text}-${index}`}
            >
              {line.text}
            </p>
          ))}

          {mode === "username" || mode === "password" ? (
            <p className="login-line is-active is-live">
              {activeLine}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="login-line is-error">{errorMessage}</p>
          ) : null}
        </div>

        {(mode === "username" || mode === "password") && (
          <input
            key={mode}
            ref={inputRef}
            aria-label={mode === "password" ? loginUi.passwordPrompt : loginUi.usernamePrompt}
            autoCapitalize="none"
            autoComplete={mode === "password" ? "current-password" : "username"}
            autoCorrect="off"
            autoFocus
            className="login-hidden-input"
            onChange={(event) => {
              setActiveInput(event.target.value);
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            type={mode === "password" ? "password" : "text"}
            value={activeInput}
          />
        )}
      </section>
    </main>
  );
}
