"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { ProjectOverview } from "@/components/workspace/ProjectOverview";
import { ApiError } from "@/lib/api/client";
import { mapProject } from "@/lib/api/mappers";
import { getProject } from "@/lib/api/projects";
import type { Project } from "@/lib/mock/types";

export default function ProjectOverviewPage() {
  const params = useParams<{ organizationId: string; projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const row = await getProject(params.projectId);
        if (cancelled) return;
        if (row.organization_id !== params.organizationId) {
          setMissing(true);
          return;
        }
        setProject(mapProject(row));
        setMissing(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) setMissing(true);
        else setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.organizationId, params.projectId]);

  if (!loading && missing) {
    notFound();
  }

  if (!project) {
    return null;
  }

  return (
    <ProjectOverview
      organizationId={params.organizationId}
      project={project}
    />
  );
}
