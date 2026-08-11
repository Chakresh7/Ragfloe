"use client";

import { useEffect, useState } from "react";
import { fetchMe, type MeResponse } from "@/lib/api/client";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: MeResponse }
  | { status: "error"; message: string };

export function BackendIdentity() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchMe();
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Could not verify identity with the API.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="backend-identity" aria-live="polite">
      <h2 className="backend-identity-title">API identity</h2>
      {state.status === "loading" ? (
        <p className="profile-email">Verifying with FastAPI…</p>
      ) : null}
      {state.status === "ready" ? (
        <div className="backend-identity-body">
          <p className="profile-email">
            Backend recognized you via Supabase access token.
          </p>
          <p className="backend-identity-meta">
            <span>id</span> {state.data.id}
          </p>
          <p className="backend-identity-meta">
            <span>email</span> {state.data.email || "—"}
          </p>
        </div>
      ) : null}
      {state.status === "error" ? (
        <p className="auth-error" role="alert">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
