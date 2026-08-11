"use client";

import { useEffect, useState } from "react";
import { SEED_ORGANIZATIONS, SEED_PROJECTS } from "./data";
import { nextOrgIcon } from "./org-icons";
import type { Organization, Plan, Project, ProjectStatus } from "./types";

const ORG_KEY = "ragfloe.mock.organizations";
const PROJECT_KEY = "ragfloe.mock.projects";

/** False until after mount so SSR and the first client render both use seed data. */
let mockHydrated = false;

function canUseStorage() {
  return mockHydrated && typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  if (!canUseStorage()) return;
  if (!localStorage.getItem(ORG_KEY)) {
    writeJson(ORG_KEY, SEED_ORGANIZATIONS);
  }
  if (!localStorage.getItem(PROJECT_KEY)) {
    writeJson(PROJECT_KEY, SEED_PROJECTS);
  }
}

/**
 * Call in client components that read mock data.
 * First render matches SSR (seed); after mount, re-render with localStorage.
 */
export function useMockReady() {
  const [ready, setReady] = useState(mockHydrated);

  useEffect(() => {
    mockHydrated = true;
    setReady(true);
  }, []);

  return ready;
}

export function listOrganizations(): Organization[] {
  if (!canUseStorage()) return SEED_ORGANIZATIONS;
  ensureSeeded();
  const orgs = readJson(ORG_KEY, SEED_ORGANIZATIONS);
  return orgs.map((org) => ({
    ...org,
    icon:
      org.icon ??
      SEED_ORGANIZATIONS.find((seed) => seed.id === org.id)?.icon ??
      "building",
  }));
}

export function getOrganization(id: string): Organization | undefined {
  return listOrganizations().find((org) => org.id === id);
}

export function createOrganization(name: string, plan: Plan = "Free"): Organization {
  const orgs = listOrganizations();
  const org: Organization = {
    id: `org_${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    plan,
    icon: nextOrgIcon(orgs.length),
    createdAt: new Date().toISOString(),
  };
  writeJson(ORG_KEY, [org, ...orgs]);
  return org;
}

export function listProjects(organizationId: string): Project[] {
  if (!canUseStorage()) {
    return SEED_PROJECTS.filter(
      (project) => project.organizationId === organizationId,
    );
  }
  ensureSeeded();
  return readJson(PROJECT_KEY, SEED_PROJECTS).filter(
    (project) => project.organizationId === organizationId,
  );
}

export function getProject(
  organizationId: string,
  projectId: string,
): Project | undefined {
  return listProjects(organizationId).find((project) => project.id === projectId);
}

export function createProject(input: {
  organizationId: string;
  name: string;
  description: string;
}): Project {
  ensureSeeded();
  const projects = readJson(PROJECT_KEY, SEED_PROJECTS);
  const project: Project = {
    id: `proj_${crypto.randomUUID().slice(0, 8)}`,
    organizationId: input.organizationId,
    name: input.name.trim(),
    description: input.description.trim() || "No description yet.",
    status: "active",
    updatedAt: new Date().toISOString(),
  };
  writeJson(PROJECT_KEY, [project, ...projects]);
  return project;
}

export function countProjects(organizationId: string): number {
  return listProjects(organizationId).length;
}

export function filterOrganizations(query: string): Organization[] {
  const q = query.trim().toLowerCase();
  const orgs = listOrganizations();
  if (!q) return orgs;
  return orgs.filter((org) => org.name.toLowerCase().includes(q));
}

export function filterProjects(
  organizationId: string,
  options: {
    query?: string;
    status?: ProjectStatus | "all" | ProjectStatus[];
    sort?: "name" | "updated";
  },
): Project[] {
  let projects = listProjects(organizationId);
  const q = options.query?.trim().toLowerCase() ?? "";
  if (q) {
    projects = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q),
    );
  }

  const statusFilter = options.status;
  if (Array.isArray(statusFilter)) {
    if (statusFilter.length > 0) {
      const allowed = new Set(statusFilter);
      projects = projects.filter((project) => allowed.has(project.status));
    }
  } else if (statusFilter && statusFilter !== "all") {
    projects = projects.filter((project) => project.status === statusFilter);
  }

  if (options.sort === "name") {
    projects = [...projects].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    projects = [...projects].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }
  return projects;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic date string (avoids locale/timezone hydration mismatches). */
export function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
