import { createClient } from "@/lib/supabase/server";
import { getAvatarUrl, getDisplayName } from "@/lib/auth/user-display";

export type AuthDisplayUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export type ServerAuthContext = {
  user: AuthDisplayUser;
  accessToken: string;
};

/**
 * One local JWT verification (`getClaims`) + session token read.
 * Avoids remote Auth `getUser()` and duplicate client setup per request.
 */
export async function getServerAuthContext(): Promise<ServerAuthContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) {
    return null;
  }

  const claims = data.claims;
  const metadata =
    claims.user_metadata && typeof claims.user_metadata === "object"
      ? (claims.user_metadata as Record<string, unknown>)
      : undefined;

  return {
    user: {
      id: String(claims.sub),
      email: typeof claims.email === "string" ? claims.email : null,
      name: getDisplayName(metadata),
      avatarUrl: getAvatarUrl(metadata),
    },
    accessToken,
  };
}

export async function getAuthDisplayUser(): Promise<AuthDisplayUser | null> {
  const ctx = await getServerAuthContext();
  return ctx?.user ?? null;
}

export async function getServerAccessToken(): Promise<string | null> {
  const ctx = await getServerAuthContext();
  return ctx?.accessToken ?? null;
}
