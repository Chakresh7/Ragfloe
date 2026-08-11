export type OAuthProvider = "google" | "github";

export const OAUTH_PROVIDERS: {
  id: OAuthProvider;
  label: string;
}[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

export function providerLabel(provider: string): string {
  const known = OAUTH_PROVIDERS.find((item) => item.id === provider);
  return known?.label ?? provider;
}

const IDENTITY_ALREADY_EXISTS_MESSAGE =
  "That Google or GitHub login is already tied to a different RagFloe account. Sign out, sign in with the account you want to keep, then open Settings → Account to connect the other provider. RagFloe will not merge two existing accounts.";

/** Map Supabase / OAuth identity-linking failures to a safe user-facing message. */
export function getIdentityLinkErrorMessage(
  error: string | null | undefined,
): string | null {
  if (!error) return null;

  const normalized = error.toLowerCase().replace(/\+/g, " ");

  if (
    normalized.includes("identity_already_exists") ||
    normalized.includes("already linked") ||
    normalized.includes("already been linked") ||
    normalized.includes("already connected to a different") ||
    normalized.includes("already tied to a different")
  ) {
    return IDENTITY_ALREADY_EXISTS_MESSAGE;
  }

  if (
    normalized.includes("manual linking") ||
    normalized.includes("manual_linking") ||
    normalized.includes("linking is not enabled")
  ) {
    return "Account linking is not enabled yet. In Supabase → Authentication → Providers, enable Manual Linking, then try again.";
  }

  if (
    normalized.includes("single_identity_not_deletable") ||
    normalized.includes("at least one identity")
  ) {
    return "You need at least one sign-in method connected. Connect another provider before disconnecting this one.";
  }

  if (
    normalized.includes("email_conflict_identity_not_deletable") ||
    normalized.includes("email conflict")
  ) {
    return "Disconnecting this provider would conflict with another account’s email. Keep both providers connected, or contact support.";
  }

  if (
    normalized.includes("cancelled") ||
    normalized.includes("canceled") ||
    normalized.includes("access_denied")
  ) {
    return "Connecting the account was cancelled. You can try again anytime.";
  }

  if (normalized.includes("could not update connected accounts")) {
    return IDENTITY_ALREADY_EXISTS_MESSAGE;
  }

  if (error.length > 180) {
    return "Could not update connected accounts. Please try again.";
  }

  return error;
}
