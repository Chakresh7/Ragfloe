"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import type { Project } from "@/lib/mock/types";

type ProjectSwitcherProps = {
  organizationId: string;
  projects: Project[];
  currentId: string;
};

export function ProjectSwitcher({
  organizationId,
  projects,
  currentId,
}: ProjectSwitcherProps) {
  const current = projects.find((project) => project.id === currentId);

  return (
    <Dropdown
      align="left"
      trigger={
        <span className="switcher-btn">
          {current?.name ?? "Project"}
          <ChevronDown size={14} />
        </span>
      }
    >
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/organizations/${organizationId}/projects/${project.id}`}
          className="rf-menu-item"
        >
          {project.name}
        </Link>
      ))}
      <Link
        href={`/organizations/${organizationId}/projects`}
        className="rf-menu-item"
      >
        All projects
      </Link>
    </Dropdown>
  );
}
