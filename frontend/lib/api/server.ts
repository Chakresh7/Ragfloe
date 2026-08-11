import { ApiError, getApiBaseUrl } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth/server-user";

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string;
};

/**
 * Server-side FastAPI fetch using the Supabase access token from cookies.
 * Pass `accessToken` when the page already resolved auth to avoid a second read.
 */
export async function serverApiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = options.accessToken ?? (await getServerAccessToken());
  if (!token) {
    throw new ApiError(401, "No active session. Sign in again.");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(401, "Backend rejected the session token.");
    }
    if (response.status === 403) {
      throw new ApiError(403, "You do not have access to this resource.");
    }
    if (response.status === 404) {
      throw new ApiError(404, "Not found.");
    }
    throw new ApiError(response.status, "Could not reach the RagFloe API.");
  }

  return (await response.json()) as T;
}
