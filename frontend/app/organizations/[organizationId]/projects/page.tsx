import { notFound } from "next/navigation";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { ApiError } from "@/lib/api/client";
import { mapOrganization, mapProject } from "@/lib/api/mappers";
import { serverApiFetch } from "@/lib/api/server";
import type { ApiOrganization, ApiProject } from "@/lib/api/types";
import { getServerAuthContext } from "@/lib/auth/server-user";
import type { Organization, Project } from "@/lib/mock/types";

type ProjectsPageProps = {
  params: Promise<{ organizationId: string }>;
};

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { organizationId } = await params;
  const auth = await getServerAuthContext();

  let organization: Organization | null = null;
  let organizations: Organization[] = [];
  let projects: Project[] = [];
  let loadError: string | null = null;

  if (!auth) {
    loadError = "No active session. Sign in again.";
  } else {
    try {
      const token = auth.accessToken;
      const [org, orgs, projectRows] = await Promise.all([
        serverApiFetch<ApiOrganization>(
          `/api/v1/organizations/${organizationId}`,
          { accessToken: token },
        ),
        serverApiFetch<ApiOrganization[]>("/api/v1/organizations", {
          accessToken: token,
        }),
        serverApiFetch<ApiProject[]>(
          `/api/v1/organizations/${organizationId}/projects`,
          { accessToken: token },
        ),
      ]);
      organization = mapOrganization(org);
      organizations = orgs.map(mapOrganization);
      projects = projectRows.map(mapProject);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
        notFound();
      }
      loadError =
        err instanceof ApiError ? err.message : "Failed to load projects.";
    }
  }

  return (
    <div className="app-shell">
      <AppTopNav
        email={auth?.user.email}
        name={auth?.user.name}
        avatarUrl={auth?.user.avatarUrl}
        leftSlot={
          organization ? (
            <OrgSwitcher
              organizations={organizations}
              currentId={organizationId}
            />
          ) : undefined
        }
      />
      <div className="app-page">
        <ProjectsView
          organizationId={organization?.id ?? organizationId}
          organizationName={organization?.name ?? "Organization"}
          initialProjects={projects}
          initialError={loadError}
        />
      </div>
    </div>
  );
}
