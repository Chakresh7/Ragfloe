import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/organizations";
}

function isLinkingReturn(next: string): boolean {
  return next.startsWith("/settings/account");
}

function linkingErrorCode(
  errorCode: string | null,
  description: string | null,
  fallback: string,
): string {
  const haystack = `${errorCode ?? ""} ${description ?? ""}`.toLowerCase();
  if (
    haystack.includes("identity_already_exists") ||
    haystack.includes("already linked")
  ) {
    return "identity_already_exists";
  }
  if (haystack.includes("access_denied") || haystack.includes("cancel")) {
    return "cancelled";
  }
  return fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const linkProvider = searchParams.get("link");
  const oauthError = searchParams.get("error");
  const oauthErrorCode = searchParams.get("error_code");
  const oauthErrorDescription = searchParams.get("error_description");

  if (oauthError) {
    const codeForUi = linkingErrorCode(
      oauthErrorCode,
      oauthErrorDescription,
      oauthError,
    );

    if (isLinkingReturn(next)) {
      const settingsUrl = new URL(next, origin);
      settingsUrl.searchParams.set("error_code", codeForUi);
      return NextResponse.redirect(settingsUrl);
    }

    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "error",
      oauthErrorDescription?.replace(/\+/g, " ") ||
        "Sign-in was cancelled or denied. Please try again.",
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    // Browser Back often returns to /auth/callback without a code. If the
    // session is still valid, send the user into the app — not /login.
    if (claimsData?.claims?.sub) {
      return NextResponse.redirect(new URL(next, origin));
    }

    if (isLinkingReturn(next)) {
      const settingsUrl = new URL(next, origin);
      settingsUrl.searchParams.set("error_code", "missing_code");
      return NextResponse.redirect(settingsUrl);
    }
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "error",
      "Missing authorization code. Please try signing in again.",
    );
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const codeForUi = linkingErrorCode(null, error.message, "exchange_failed");

    if (isLinkingReturn(next)) {
      const settingsUrl = new URL(next, origin);
      settingsUrl.searchParams.set("error_code", codeForUi);
      return NextResponse.redirect(settingsUrl);
    }

    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "error",
      "Could not complete sign-in. Please try again.",
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isLinkingReturn(next)) {
    const settingsUrl = new URL(next, origin);
    if (linkProvider === "google" || linkProvider === "github") {
      settingsUrl.searchParams.set("linked", linkProvider);
    }
    return NextResponse.redirect(settingsUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
