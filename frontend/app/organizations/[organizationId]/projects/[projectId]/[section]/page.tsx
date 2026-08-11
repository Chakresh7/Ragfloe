"use client";

import { useParams, notFound } from "next/navigation";
import { WORKSPACE_SECTIONS } from "@/lib/mock/types";

export default function WorkspaceSectionPage() {
  const params = useParams<{
    organizationId: string;
    projectId: string;
    section: string;
  }>();

  const section = WORKSPACE_SECTIONS.find((item) => item.slug === params.section);

  if (!section || section.slug === "overview") {
    notFound();
  }

  return (
    <div className="coming-soon">
      <h1>{section.label}</h1>
      <p>
        This module is coming soon. Navigation is wired for Phase 2 UI; backend
        and product logic arrive in later phases.
      </p>
    </div>
  );
}
