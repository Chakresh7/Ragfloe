"use client";

import { usePathname } from "next/navigation";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import { ProjectSwitcher } from "@/components/layout/ProjectSwitcher";
import { TopNavActions } from "@/components/layout/TopNavActions";
import type { Organization, Project } from "@/lib/mock/types";

type WorkspaceShellProps = {
  children: React.ReactNode;
  organizationId: string;
  projectId: string;
  organization: Organization;
  project: Project;
  organizations: Organization[];
  projects: Project[];
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

export function WorkspaceShell({
  children,
  organizationId,
  projectId,
  organizations,
  projects,
  email,
  name,
  avatarUrl,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const activeSlug = pathname.endsWith(`/${projectId}`)
    ? "overview"
    : (pathname.split("/").pop() ?? "overview");

  return (
    <div className="workspace-shell">
      <WorkspaceSidebar
        organizationId={organizationId}
        projectId={projectId}
        activeSlug={activeSlug}
      />
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-topbar-left">
            <OrgSwitcher
              organizations={organizations}
              currentId={organizationId}
            />
            <span className="workspace-crumb">/</span>
            <ProjectSwitcher
              organizationId={organizationId}
              projects={projects}
              currentId={projectId}
            />
          </div>
          <TopNavActions email={email} name={name} avatarUrl={avatarUrl} />
        </header>
        <div className="workspace-content">{children}</div>
      </div>
    </div>
  );
}
