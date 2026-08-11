import { apiFetch } from "./client";
import type { ApiProject } from "./types";

export async function listProjects(
  organizationId: string,
): Promise<ApiProject[]> {
  return apiFetch<ApiProject[]>(
    `/api/v1/organizations/${organizationId}/projects`,
  );
}

export async function createProject(
  organizationId: string,
  input: {
    name: string;
    description?: string;
    status?: string;
  },
): Promise<ApiProject> {
  return apiFetch<ApiProject>(
    `/api/v1/organizations/${organizationId}/projects`,
    {
      method: "POST",
      body: {
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? "active",
      },
    },
  );
}

export async function getProject(projectId: string): Promise<ApiProject> {
  return apiFetch<ApiProject>(`/api/v1/projects/${projectId}`);
}

export async function updateProject(
  projectId: string,
  input: {
    name?: string;
    description?: string;
    status?: string;
  },
): Promise<ApiProject> {
  return apiFetch<ApiProject>(`/api/v1/projects/${projectId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/projects/${projectId}`, {
    method: "DELETE",
  });
}
