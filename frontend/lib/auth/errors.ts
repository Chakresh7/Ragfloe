import { getIdentityLinkErrorMessage } from "@/lib/auth/identities";

export function getAuthErrorMessage(error: string | undefined): string | null {
  if (!error) return null;

  const identityMessage = getIdentityLinkErrorMessage(error);
  if (
    identityMessage &&
    (error.toLowerCase().includes("already linked") ||
      error.toLowerCase().includes("identity_already_exists") ||
      error.toLowerCase().includes("manual linking") ||
      error.toLowerCase().includes("manual_linking"))
  ) {
    return identityMessage;
  }

  const normalized = error.toLowerCase();

  if (
    normalized.includes("access_denied") ||
    normalized.includes("cancelled") ||
    normalized.includes("canceled") ||
    normalized.includes("denied")
  ) {
    return "Sign-in was cancelled or denied. Please try again.";
  }

  if (
    normalized.includes("user profile") ||
    normalized.includes("user email") ||
    normalized.includes("external provider")
  ) {
    return "Could not load your profile from the sign-in provider. Check the provider settings in Supabase and try again.";
  }

  if (normalized.includes("missing authorization code")) {
    return "Missing authorization code. Please try signing in again.";
  }

  if (
    normalized.includes("exchange") ||
    normalized.includes("could not complete")
  ) {
    return "Could not complete sign-in. Please try again.";
  }

  if (
    normalized.includes("supabase") ||
    normalized.includes("configuration") ||
    normalized.includes("misconfigured")
  ) {
    return "Authentication is not configured correctly. Check your environment variables.";
  }

  // Never surface raw provider/stack details beyond a short safe string.
  if (error.length > 180) {
    return "Something went wrong during sign-in. Please try again.";
  }

  return error;
}
