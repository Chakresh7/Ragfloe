"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Network,
  Search,
  MessageSquareText,
  FlaskConical,
  BarChart3,
  KeyRound,
  Activity,
  Settings,
} from "lucide-react";
import { WORKSPACE_SECTIONS } from "@/lib/mock/types";

const ICONS = {
  overview: LayoutDashboard,
  knowledge: BookOpen,
  "rag-architecture": Network,
  retrieval: Search,
  prompts: MessageSquareText,
  playground: FlaskConical,
  evaluation: BarChart3,
  api: KeyRound,
  usage: Activity,
  settings: Settings,
} as const;

type WorkspaceSidebarProps = {
  organizationId: string;
  projectId: string;
  activeSlug: string;
};

export function WorkspaceSidebar({
  organizationId,
  projectId,
  activeSlug,
}: WorkspaceSidebarProps) {
  const base = `/organizations/${organizationId}/projects/${projectId}`;

  return (
    <aside className="workspace-sidebar">
      <Link href="/organizations" className="workspace-sidebar-brand">
        RagFloe
      </Link>
      <nav className="workspace-nav" aria-label="Workspace">
        {WORKSPACE_SECTIONS.map((section) => {
          const Icon = ICONS[section.slug];
          const href =
            section.slug === "overview" ? base : `${base}/${section.slug}`;
          const active = activeSlug === section.slug;
          return (
            <Link
              key={section.slug}
              href={href}
              className={`workspace-nav-link ${active ? "workspace-nav-link-active" : ""}`.trim()}
            >
              <Icon size={15} />
              {section.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
