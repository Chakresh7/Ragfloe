import { createClient } from "@/lib/supabase/client";

export type MeResponse = {
  id: string;
  email: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Add it to .env.local.",
    );
  }
  return base;
}

export async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ApiError(401, "No active session. Sign in again.");
  }
  return session.access_token;
}

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = await getAccessToken();
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
    if (response.status === 409) {
      throw new ApiError(409, "Conflict.");
    }
    if (response.status === 422) {
      throw new ApiError(422, "Validation failed.");
    }
    throw new ApiError(response.status, "Could not reach the RagFloe API.");
  }

  return (await response.json()) as T;
}

export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/v1/me");
}
