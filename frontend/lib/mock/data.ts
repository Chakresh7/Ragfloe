import type { ActivityItem, Organization, Project } from "./types";

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: "org_acme",
    name: "Acme AI",
    plan: "Pro",
    icon: "hexagon",
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "org_research",
    name: "Research Lab",
    plan: "Free",
    icon: "flask",
    createdAt: "2026-02-03T10:00:00.000Z",
  },
  {
    id: "org_chakri",
    name: "Chakri's Org",
    plan: "Team",
    icon: "layers",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj_legal",
    organizationId: "org_acme",
    name: "Legal AI",
    description: "Contract Q&A over policy and clause libraries.",
    status: "active",
    updatedAt: "2026-08-08T14:20:00.000Z",
  },
  {
    id: "proj_hr",
    organizationId: "org_acme",
    name: "HR Assistant",
    description: "Employee handbook retrieval and onboarding answers.",
    status: "active",
    updatedAt: "2026-08-07T09:10:00.000Z",
  },
  {
    id: "proj_research",
    organizationId: "org_acme",
    name: "Research AI",
    description: "Paper corpus search with citation-aware answers.",
    status: "paused",
    updatedAt: "2026-08-01T16:45:00.000Z",
  },
  {
    id: "proj_lab_notes",
    organizationId: "org_research",
    name: "Lab Notes",
    description: "Experiment logs and protocol retrieval.",
    status: "active",
    updatedAt: "2026-08-09T11:00:00.000Z",
  },
  {
    id: "proj_lit",
    organizationId: "org_research",
    name: "Literature Scout",
    description: "Find related work across arXiv snapshots.",
    status: "active",
    updatedAt: "2026-08-05T08:30:00.000Z",
  },
  {
    id: "proj_support",
    organizationId: "org_chakri",
    name: "Support Copilot",
    description: "Ticket deflection over product docs.",
    status: "active",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "proj_sales",
    organizationId: "org_chakri",
    name: "Sales Briefs",
    description: "Account research from CRM notes and PDFs.",
    status: "paused",
    updatedAt: "2026-07-28T18:00:00.000Z",
  },
  {
    id: "proj_ops",
    organizationId: "org_chakri",
    name: "Ops Runbooks",
    description: "Incident playbooks and SOPs as RAG.",
    status: "active",
    updatedAt: "2026-08-06T07:15:00.000Z",
  },
];

export const SEED_ACTIVITY: ActivityItem[] = [
  { id: "a1", label: "Indexed 12 documents into Knowledge", time: "2h ago" },
  { id: "a2", label: "Playground query returned 4 chunks", time: "5h ago" },
  { id: "a3", label: "RAG architecture draft saved", time: "Yesterday" },
  { id: "a4", label: "Project status set to Active", time: "3d ago" },
];
