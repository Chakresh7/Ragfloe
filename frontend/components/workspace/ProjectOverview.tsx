import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SEED_ACTIVITY } from "@/lib/mock/data";
import type { Project } from "@/lib/mock/types";
import Link from "next/link";

type OverviewProps = {
  organizationId: string;
  project: Project;
};

export function ProjectOverview({ organizationId, project }: OverviewProps) {
  const base = `/organizations/${organizationId}/projects/${project.id}`;

  return (
    <div>
      <div className="app-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 className="app-page-title">{project.name}</h1>
            <Badge tone={project.status === "active" ? "success" : "warning"}>
              {project.status}
            </Badge>
          </div>
          <p className="app-page-subtitle">{project.description}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-card-label">Knowledge</p>
          <p className="stat-card-value">12 docs</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Queries</p>
          <p className="stat-card-value">1.2k</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Usage</p>
          <p className="stat-card-value">38%</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Status</p>
          <p className="stat-card-value" style={{ textTransform: "capitalize" }}>
            {project.status}
          </p>
        </div>
      </div>

      <h2 className="section-label">Quick actions</h2>
      <div className="quick-actions">
        <Link href={`${base}/knowledge`}>
          <Button variant="secondary" className="rf-btn-block">
            Add Knowledge
          </Button>
        </Link>
        <Link href={`${base}/rag-architecture`}>
          <Button variant="secondary" className="rf-btn-block">
            Configure RAG
          </Button>
        </Link>
        <Link href={`${base}/playground`}>
          <Button variant="secondary" className="rf-btn-block">
            Open Playground
          </Button>
        </Link>
        <Link href={`${base}/api`}>
          <Button variant="secondary" className="rf-btn-block">
            View API
          </Button>
        </Link>
      </div>

      <h2 className="section-label">Recent activity</h2>
      <div className="activity-list">
        {SEED_ACTIVITY.map((item) => (
          <div key={item.id} className="activity-item">
            <span>{item.label}</span>
            <span className="activity-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
