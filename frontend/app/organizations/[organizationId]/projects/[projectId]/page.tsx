import { notFound } from "next/navigation";
import { ProjectOverview } from "@/components/workspace/ProjectOverview";
import { ApiError } from "@/lib/api/client";
import { mapProject } from "@/lib/api/mappers";
import { serverApiFetch } from "@/lib/api/server";
import type { ApiProject } from "@/lib/api/types";
import { getServerAuthContext } from "@/lib/auth/server-user";

type ProjectOverviewPageProps = {
  params: Promise<{ organizationId: string; projectId: string }>;
};

export default async function ProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { organizationId, projectId } = await params;
  const auth = await getServerAuthContext();
  if (!auth) {
    notFound();
  }

  try {
    const project = await serverApiFetch<ApiProject>(
      `/api/v1/projects/${projectId}`,
      { accessToken: auth.accessToken },
    );
    if (project.organization_id !== organizationId) {
      notFound();
    }
    return (
      <ProjectOverview
        organizationId={organizationId}
        project={mapProject(project)}
      />
    );
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    notFound();
  }
}
