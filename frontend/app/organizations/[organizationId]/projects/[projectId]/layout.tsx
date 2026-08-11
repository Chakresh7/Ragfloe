import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { ApiError } from "@/lib/api/client";
import { mapOrganization, mapProject } from "@/lib/api/mappers";
import { serverApiFetch } from "@/lib/api/server";
import type { ApiOrganization, ApiProject } from "@/lib/api/types";
import { getServerAuthContext } from "@/lib/auth/server-user";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ organizationId: string; projectId: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { organizationId, projectId } = await params;
  const auth = await getServerAuthContext();

  if (!auth) {
    notFound();
  }

  try {
    const token = auth.accessToken;
    const [org, proj, orgs, projs] = await Promise.all([
      serverApiFetch<ApiOrganization>(`/api/v1/organizations/${organizationId}`, {
        accessToken: token,
      }),
      serverApiFetch<ApiProject>(`/api/v1/projects/${projectId}`, {
        accessToken: token,
      }),
      serverApiFetch<ApiOrganization[]>("/api/v1/organizations", {
        accessToken: token,
      }),
      serverApiFetch<ApiProject[]>(
        `/api/v1/organizations/${organizationId}/projects`,
        { accessToken: token },
      ),
    ]);

    if (proj.organization_id !== organizationId) {
      notFound();
    }

    return (
      <WorkspaceShell
        organizationId={organizationId}
        projectId={projectId}
        organization={mapOrganization(org)}
        project={mapProject(proj)}
        organizations={orgs.map(mapOrganization)}
        projects={projs.map(mapProject)}
        email={auth.user.email}
        name={auth.user.name}
        avatarUrl={auth.user.avatarUrl}
      >
        {children}
      </WorkspaceShell>
    );
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    notFound();
  }
}
