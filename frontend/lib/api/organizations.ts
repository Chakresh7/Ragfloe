import { apiFetch } from "./client";
import type { ApiOrganization } from "./types";

export async function listOrganizations(): Promise<ApiOrganization[]> {
  return apiFetch<ApiOrganization[]>("/api/v1/organizations");
}

export async function createOrganization(input: {
  name: string;
  plan?: string;
}): Promise<ApiOrganization> {
  return apiFetch<ApiOrganization>("/api/v1/organizations", {
    method: "POST",
    body: {
      name: input.name,
      plan: (input.plan ?? "free").toLowerCase(),
    },
  });
}

export async function getOrganization(
  organizationId: string,
): Promise<ApiOrganization> {
  return apiFetch<ApiOrganization>(`/api/v1/organizations/${organizationId}`);
}

export async function updateOrganization(
  organizationId: string,
  input: { name?: string; plan?: string },
): Promise<ApiOrganization> {
  return apiFetch<ApiOrganization>(`/api/v1/organizations/${organizationId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/organizations/${organizationId}`, {
    method: "DELETE",
  });
}
