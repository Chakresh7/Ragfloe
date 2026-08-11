import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getOrgIcon } from "@/lib/mock/org-icons";
import type { Organization } from "@/lib/mock/types";

type OrgCardProps = {
  organization: Organization;
};

export function OrgCard({ organization }: OrgCardProps) {
  const projectCount = organization.projectCount ?? 0;
  const Icon = getOrgIcon(organization.icon);

  return (
    <Link
      href={`/organizations/${organization.id}/projects`}
      className="rf-card"
    >
      <div className="rf-card-body">
        <div className="rf-avatar" aria-hidden="true">
          <Icon size={15} strokeWidth={1.75} />
        </div>
        <div className="rf-card-main">
          <h2 className="rf-card-title">{organization.name}</h2>
          <p className="rf-card-meta">
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>
      <div className="rf-card-footer">
        <Badge tone={organization.plan === "Free" ? "muted" : "success"}>
          {organization.plan}
        </Badge>
        <span className="rf-card-cta">
          Open
          <ArrowUpRight size={12} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
