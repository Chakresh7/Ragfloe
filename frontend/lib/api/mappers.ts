import type { ApiOrganization, ApiProject } from "@/lib/api/types";
import type { OrgIcon, Organization, Plan, Project, ProjectStatus } from "@/lib/mock/types";

const PLAN_MAP: Record<string, Plan> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

const ICON_CYCLE: OrgIcon[] = [
  "building",
  "layers",
  "flask",
  "hexagon",
  "landmark",
];

export function mapPlan(plan: string): Plan {
  return PLAN_MAP[plan.toLowerCase()] ?? "Free";
}

export function iconForSlug(slug: string): OrgIcon {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % ICON_CYCLE.length;
  }
  return ICON_CYCLE[hash] ?? "building";
}

export function mapOrganization(org: ApiOrganization): Organization {
  return {
    id: org.id,
    name: org.name,
    plan: mapPlan(org.plan),
    icon: iconForSlug(org.slug),
    createdAt: org.created_at,
    projectCount: org.project_count,
  };
}

export function mapProject(project: ApiProject): Project {
  return {
    id: project.id,
    organizationId: project.organization_id,
    name: project.name,
    description: project.description ?? "No description yet.",
    status: (project.status as ProjectStatus) || "active",
    updatedAt: project.updated_at,
  };
}

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
