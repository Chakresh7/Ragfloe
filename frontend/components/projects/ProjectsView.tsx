"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./ProjectCard";
import { ProjectToolbar } from "./ProjectToolbar";
import { NewProjectDialog } from "./NewProjectDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { mapProject } from "@/lib/api/mappers";
import { createProject, listProjects } from "@/lib/api/projects";
import type { Project, ProjectStatus } from "@/lib/mock/types";
import { Plus } from "lucide-react";

type ProjectsViewProps = {
  organizationId: string;
  organizationName: string;
  initialProjects?: Project[];
  initialError?: string | null;
};

export function ProjectsView({
  organizationId,
  organizationName,
  initialProjects = [],
  initialError = null,
}: ProjectsViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [sort, setSort] = useState<"name" | "updated">("updated");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listProjects(organizationId);
      setProjects(rows.map(mapProject));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load projects.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const refreshQuiet = useCallback(async () => {
    try {
      const rows = await listProjects(organizationId);
      setProjects(rows.map(mapProject));
      setActionError(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to refresh projects.";
      setActionError(message);
    }
  }, [organizationId]);

  const filtered = useMemo(() => {
    let rows = [...projects];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (project) =>
          project.name.toLowerCase().includes(q) ||
          project.description.toLowerCase().includes(q),
      );
    }
    if (statuses.length > 0) {
      const allowed = new Set(statuses);
      rows = rows.filter((project) => allowed.has(project.status));
    }
    if (sort === "name") {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      rows.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return rows;
  }, [projects, query, statuses, sort]);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const project = await createProject(organizationId, {
        name,
        description,
      });
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/organizations/${organizationId}/projects/${project.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create project.";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="app-page-header">
        <div>
          <p className="app-eyebrow">{organizationName}</p>
          <h1 className="app-page-title">Projects</h1>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus size={14} />
          New project
        </Button>
      </div>

      <ProjectToolbar
        query={query}
        statuses={statuses}
        sort={sort}
        view={view}
        onQueryChange={setQuery}
        onStatusesChange={setStatuses}
        onSortChange={setSort}
        onViewChange={setView}
      />

      {actionError ? (
        <p className="app-page-subtitle" style={{ color: "var(--danger)", marginBottom: "0.75rem" }}>
          {actionError}
        </p>
      ) : null}

      {error ? (
        <EmptyState
          title="Something went wrong"
          description={error}
          action={
            <Button variant="secondary" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
      ) : loading ? (
        <EmptyState title="Loading projects" description="Fetching projects…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query || statuses.length > 0 ? "No projects found" : "No projects yet"}
          description={
            query || statuses.length > 0
              ? "Try adjusting search or filters."
              : "Create a project to open the RagFloe workspace."
          }
          action={
            !query && statuses.length === 0 ? (
              <Button variant="primary" onClick={() => setOpen(true)}>
                <Plus size={14} />
                New project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={view === "grid" ? "card-grid" : "list-view"}>
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              organizationId={organizationId}
              project={project}
              onChanged={() => void refreshQuiet()}
              onError={setActionError}
            />
          ))}
        </div>
      )}

      <NewProjectDialog
        open={open}
        name={name}
        description={description}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onClose={() => setOpen(false)}
        onConfirm={() => void handleCreate()}
      />
    </>
  );
}
