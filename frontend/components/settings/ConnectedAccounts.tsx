"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserIdentity } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  getIdentityLinkErrorMessage,
  OAUTH_PROVIDERS,
  providerLabel,
  type OAuthProvider,
} from "@/lib/auth/identities";

export type ConnectedIdentity = {
  identity_id: string;
  provider: string;
  email: string | null;
};

type ConnectedAccountsProps = {
  initialIdentities: ConnectedIdentity[];
  accountEmail?: string | null;
  initialMessage?: string | null;
  initialError?: string | null;
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function toConnected(identity: UserIdentity): ConnectedIdentity {
  return {
    identity_id: identity.identity_id,
    provider: identity.provider,
    email:
      typeof identity.identity_data?.email === "string"
        ? identity.identity_data.email
        : null,
  };
}

export function ConnectedAccounts({
  initialIdentities,
  accountEmail = null,
  initialMessage = null,
  initialError = null,
}: ConnectedAccountsProps) {
  const router = useRouter();
  const [identities, setIdentities] =
    useState<ConnectedIdentity[]>(initialIdentities);
  const [pending, setPending] = useState<OAuthProvider | "unlink" | null>(null);
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    if (!initialMessage && !initialError) return;
    const url = new URL(window.location.href);
    if (
      !url.searchParams.has("linked") &&
      !url.searchParams.has("error") &&
      !url.searchParams.has("error_code")
    ) {
      return;
    }
    url.searchParams.delete("linked");
    url.searchParams.delete("error");
    url.searchParams.delete("error_code");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [initialMessage, initialError]);

  async function connect(provider: OAuthProvider) {
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setError(
        "Authentication is not configured correctly. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setPending(provider);

    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/settings/account");
      callbackUrl.searchParams.set("link", provider);

      const { error: linkError } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          ...(provider === "google"
            ? {
                queryParams: {
                  prompt: "select_account consent",
                  access_type: "offline",
                },
              }
            : {
                scopes: "read:user user:email",
              }),
        },
      });

      if (linkError) {
        setError(
          getIdentityLinkErrorMessage(linkError.message) ??
            "Could not start account linking. Please try again.",
        );
        setPending(null);
      }
    } catch {
      setError("Could not start account linking. Please try again.");
      setPending(null);
    }
  }

  async function disconnect(identity: ConnectedIdentity) {
    if (identities.length < 2) {
      setError(
        "You need at least one sign-in method connected. Connect another provider before disconnecting this one.",
      );
      return;
    }

    setError(null);
    setMessage(null);
    setPending("unlink");

    try {
      const supabase = createClient();
      const { data, error: identitiesError } =
        await supabase.auth.getUserIdentities();

      if (identitiesError) {
        setError(
          getIdentityLinkErrorMessage(identitiesError.message) ??
            "Could not disconnect that account. Please try again.",
        );
        setPending(null);
        return;
      }

      const match = (data?.identities ?? []).find(
        (item) => item.identity_id === identity.identity_id,
      );

      if (!match) {
        setError("That connected account is no longer available. Refresh and try again.");
        setPending(null);
        return;
      }

      const { error: unlinkError } = await supabase.auth.unlinkIdentity(match);

      if (unlinkError) {
        setError(
          getIdentityLinkErrorMessage(unlinkError.message) ??
            "Could not disconnect that account. Please try again.",
        );
        setPending(null);
        return;
      }

      const nextIdentities = (data?.identities ?? [])
        .filter((item) => item.identity_id !== identity.identity_id)
        .map(toConnected);

      setIdentities(nextIdentities);
      setMessage(`${providerLabel(identity.provider)} disconnected.`);
      setPending(null);
      router.refresh();
    } catch {
      setError("Could not disconnect that account. Please try again.");
      setPending(null);
    }
  }

  return (
    <section className="settings-section" aria-labelledby="connected-accounts-heading">
      <div className="settings-section-header">
        <h2 id="connected-accounts-heading" className="settings-section-title">
          Connected accounts
        </h2>
        <p className="settings-section-copy">
          Link Google and GitHub to{" "}
          <strong>{accountEmail ?? "this RagFloe user"}</strong>. If the
          provider login is already used by another RagFloe account, linking is
          blocked on purpose — sign into that account instead of merging by
          email.
        </p>
      </div>

      {message ? (
        <p className="settings-banner settings-banner-success" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="connected-accounts-list">
        {OAUTH_PROVIDERS.map((provider) => {
          const identity = identities.find((item) => item.provider === provider.id);
          const connected = Boolean(identity);

          return (
            <li key={provider.id} className="connected-account-row">
              <div className="connected-account-meta">
                <span className="connected-account-provider">
                  {provider.id === "google" ? <GoogleIcon /> : <GitHubIcon />}
                  {provider.label}
                </span>
                <span
                  className={`connected-account-status${connected ? " is-connected" : ""}`}
                >
                  {connected ? "Connected" : "Not connected"}
                </span>
                {identity?.email ? (
                  <span className="connected-account-email">{identity.email}</span>
                ) : null}
              </div>

              <div className="connected-account-actions">
                {connected && identity ? (
                  <button
                    type="button"
                    className="rf-btn rf-btn-ghost"
                    disabled={pending !== null || identities.length < 2}
                    title={
                      identities.length < 2
                        ? "Connect another provider before disconnecting this one"
                        : undefined
                    }
                    onClick={() => void disconnect(identity)}
                  >
                    {pending === "unlink" ? "Working…" : "Disconnect"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    disabled={pending !== null}
                    onClick={() => void connect(provider.id)}
                  >
                    {pending === provider.id ? "Redirecting…" : "Connect"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="oauth-icon">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="oauth-icon oauth-icon-github">
      <path d="M12 2C6.477 2 2 6.586 2 12.253c0 4.537 2.865 8.369 6.839 9.725.5.094.683-.222.683-.492 0-.242-.009-.883-.014-1.733-2.782.62-3.369-1.38-3.369-1.38-.455-1.18-1.11-1.495-1.11-1.495-.908-.638.069-.625.069-.625 1.004.073 1.532 1.06 1.532 1.06.892 1.57 2.341 1.116 2.91.854.091-.662.35-1.116.636-1.372-2.22-.259-4.555-1.142-4.555-5.084 0-1.122.39-2.041 1.029-2.76-.103-.26-.446-1.302.098-2.714 0 0 .84-.276 2.75 1.054A9.3 9.3 0 0 1 12 6.912a9.3 9.3 0 0 1 2.504.347c1.909-1.33 2.748-1.054 2.748-1.054.546 1.412.202 2.454.1 2.714.64.719 1.028 1.638 1.028 2.76 0 3.952-2.339 4.822-4.566 5.076.359.318.679.945.679 1.904 0 1.374-.012 2.481-.012 2.819 0 .273.18.592.688.491C19.138 20.619 22 16.788 22 12.253 22 6.586 17.523 2 12 2z" />
    </svg>
  );
}
