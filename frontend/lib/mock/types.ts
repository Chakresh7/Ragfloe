export type Plan = "Free" | "Pro" | "Team";

export type ProjectStatus = "active" | "paused" | "archived";

export type OrgIcon =
  | "building"
  | "flask"
  | "hexagon"
  | "landmark"
  | "layers";

export type Organization = {
  id: string;
  name: string;
  plan: Plan;
  icon?: OrgIcon;
  createdAt: string;
  projectCount?: number;
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  updatedAt: string;
};

export type ActivityItem = {
  id: string;
  label: string;
  time: string;
};

export const WORKSPACE_SECTIONS = [
  { slug: "overview", label: "Overview" },
  { slug: "knowledge", label: "Knowledge" },
  { slug: "rag-architecture", label: "RAG Architecture" },
  { slug: "retrieval", label: "Retrieval" },
  { slug: "prompts", label: "Prompts" },
  { slug: "playground", label: "Playground" },
  { slug: "evaluation", label: "Evaluation" },
  { slug: "api", label: "API" },
  { slug: "usage", label: "Usage" },
  { slug: "settings", label: "Settings" },
] as const;

export type WorkspaceSectionSlug = (typeof WORKSPACE_SECTIONS)[number]["slug"];
