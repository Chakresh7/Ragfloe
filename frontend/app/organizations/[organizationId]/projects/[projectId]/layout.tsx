"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, notFound } from "next/navigation";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import { ProjectSwitcher } from "@/components/layout/ProjectSwitcher";
import { TopNavActions } from "@/components/layout/TopNavActions";
import { getAvatarUrl, getDisplayName } from "@/lib/auth/user-display";
import { ApiError } from "@/lib/api/client";
import { mapOrganization, mapProject } from "@/lib/api/mappers";
import { getOrganization, listOrganizations } from "@/lib/api/organizations";
import { getProject, listProjects } from "@/lib/api/projects";
import type { Organization, Project } from "@/lib/mock/types";
import { createClient } from "@/lib/supabase/client";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ organizationId: string; projectId: string }>();
  const pathname = usePathname();
  const { organizationId, projectId } = params;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setEmail(user?.email ?? null);
      const metadata = user?.user_metadata as Record<string, unknown> | undefined;
      setName(getDisplayName(metadata));
      setAvatarUrl(getAvatarUrl(metadata));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [org, proj, orgs, projs] = await Promise.all([
          getOrganization(organizationId),
          getProject(projectId),
          listOrganizations(),
          listProjects(organizationId),
        ]);
        if (cancelled) return;
        if (proj.organization_id !== organizationId) {
          setMissing(true);
          return;
        }
        setOrganization(mapOrganization(org));
        setProject(mapProject(proj));
        setOrganizations(orgs.map(mapOrganization));
        setProjects(projs.map(mapProject));
        setMissing(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setMissing(true);
        } else {
          setMissing(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [organizationId, projectId]);

  if (!loading && missing) {
    notFound();
  }

  if (!organization || !project) {
    return (
      <div className="workspace-shell">
        <div className="workspace-main">
          <div className="workspace-content" />
        </div>
      </div>
    );
  }

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
