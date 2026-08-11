import { Suspense } from "react";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { getAuthErrorMessage } from "@/lib/auth/errors";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params.error);

  return (
    <main className="login-shell" data-login-theme="light">
      <RedirectIfAuthenticated />
      <div className="auth-panel">
        <header className="auth-header">
          <p className="brand">RagFloe</p>
          <h1 className="login-headline">Sign in</h1>
          <p className="login-support">
            Continue to your workspace with Google or GitHub.
          </p>
        </header>

        <div className="login-actions">
          {errorMessage ? (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <Suspense fallback={<div className="oauth-skeleton" aria-hidden="true" />}>
            <OAuthButtons />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
