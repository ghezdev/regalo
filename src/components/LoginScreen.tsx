"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authenticateUser,
  getFixedUsers,
  persistSession,
  readSession,
} from "@/lib/session";

const initialFormState = {
  username: "",
  password: "",
};

export function LoginScreen() {
  const router = useRouter();
  const users = useMemo(() => getFixedUsers(), []);
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = readSession();

    if (session) {
      router.replace("/game");
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const session = authenticateUser(formState.username, formState.password);

    if (!session) {
      setIsSubmitting(false);
      setError("Ese recuerdo no coincide. Proba con uno de los dos usuarios definidos.");
      return;
    }

    persistSession(session);
    router.push("/game");
  };

  return (
    <main className="screen">
      <section className="night-frame login-layout" aria-label="Ingreso al regalo">
        <div className="login-scene">
          <div className="scene-copy">
            <span className="eyebrow">Plaza Nocturna</span>
            <h1>Regalo para Naomi</h1>
            <p>
              Una entrada simple para llegar directo a la plaza. El personaje se
              asigna automaticamente segun el usuario.
            </p>
          </div>

          <div className="pixel-plaza" aria-hidden="true">
            <div className="moon" />
            <div className="plaza-ground" />
            <div className="path-horizontal" />
            <div className="path-vertical" />
            <div className="fountain" />
            <div className="building left">
              <div className="window left" />
              <div className="window right" />
              <div className="door" />
            </div>
            <div className="building right">
              <div className="window left" />
              <div className="window right" />
              <div className="door" />
            </div>
            <div className="flower-row" />
          </div>
        </div>

        <aside className="login-panel">
          <div className="panel-card">
            <h2>Entrar</h2>
            <p>
              Login fijo para el MVP. Guarda una sesion local y redirige al juego.
            </p>

            <form className="pixel-form" onSubmit={handleSubmit}>
              <label className="pixel-label" htmlFor="username">
                Usuario
                <input
                  id="username"
                  name="username"
                  className="pixel-input"
                  autoComplete="username"
                  value={formState.username}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="pixel-label" htmlFor="password">
                Clave
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="pixel-input"
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>

              {error ? <div className="error-box">{error}</div> : null}

              <button className="pixel-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Abriendo plaza..." : "Entrar a la plaza"}
              </button>
            </form>
          </div>

          <div className="panel-card">
            <h2>Usuarios del MVP</h2>
            <div className="credential-list">
              {users.map((user) => (
                <div className="credential-item" key={user.username}>
                  <span>{user.displayName}</span>
                  <span>
                    {user.username} / {user.password}
                  </span>
                </div>
              ))}
            </div>
            <p className="field-hint">
              La seguridad real no forma parte de esta version.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
