"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { ApiError } from "@/lib/api/client";
import { formatUpdatedAt } from "@/lib/api/mappers";
import { deleteProject, updateProject } from "@/lib/api/projects";
import type { Project } from "@/lib/mock/types";

type ProjectCardProps = {
  organizationId: string;
  project: Project;
  onChanged?: () => void;
  onError?: (message: string) => void;
};

function statusTone(status: Project["status"]) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "muted" as const;
}

export function ProjectCard({
  organizationId,
  project,
  onChanged,
  onError,
}: ProjectCardProps) {
  const href = `/organizations/${organizationId}/projects/${project.id}`;
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isArchived = project.status === "archived";

  async function handleArchive() {
    if (busy) return;
    setBusy(true);
    try {
      await updateProject(project.id, {
        status: isArchived ? "active" : "archived",
      });
      setMenuOpen(false);
      onChanged?.();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : isArchived
            ? "Failed to restore project."
            : "Failed to archive project.";
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }

  function openDeleteDialog() {
    setMenuOpen(false);
    setDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (busy) return;
    setBusy(true);
    try {
      await deleteProject(project.id);
      setDeleteOpen(false);
      onChanged?.();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete project.";
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="rf-card">
        <div className="rf-card-body">
          <Link href={href} className="rf-card-link">
            <div className="rf-avatar" aria-hidden="true">
              <FolderKanban size={14} />
            </div>
            <div className="rf-card-main">
              <h2 className="rf-card-title">{project.name}</h2>
              <p className="rf-card-meta">{project.description}</p>
            </div>
          </Link>
          <div className="rf-card-actions">
            <Dropdown
              open={menuOpen}
              onOpenChange={setMenuOpen}
              trigger={
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label="Project actions"
                  disabled={busy}
                >
                  <MoreVertical size={15} />
                </Button>
              }
            >
              <button
                type="button"
                className="rf-menu-item"
                disabled={busy}
                onClick={() => void handleArchive()}
              >
                {busy
                  ? "Working…"
                  : isArchived
                    ? "Restore"
                    : "Archive"}
              </button>
              <button
                type="button"
                className="rf-menu-item rf-menu-item-danger"
                disabled={busy}
                onClick={openDeleteDialog}
              >
                Delete
              </button>
            </Dropdown>
          </div>
        </div>
        <div className="rf-card-footer">
          <Badge tone={statusTone(project.status)}>{project.status}</Badge>
          <span>Updated {formatUpdatedAt(project.updatedAt)}</span>
        </div>
      </div>

      <DeleteProjectDialog
        open={deleteOpen}
        projectName={project.name}
        busy={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  );
}
