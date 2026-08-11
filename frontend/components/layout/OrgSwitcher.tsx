"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { getOrgIcon } from "@/lib/mock/org-icons";
import type { Organization } from "@/lib/mock/types";

type OrgSwitcherProps = {
  organizations: Organization[];
  currentId: string;
};

function OrgIconMark({
  icon,
  size = 14,
}: {
  icon?: Organization["icon"];
  size?: number;
}) {
  const Icon = getOrgIcon(icon);
  return <Icon size={size} strokeWidth={1.75} />;
}

export function OrgSwitcher({ organizations, currentId }: OrgSwitcherProps) {
  const current = organizations.find((org) => org.id === currentId);

  return (
    <Dropdown
      align="left"
      trigger={
        <span className="switcher-btn">
          <OrgIconMark icon={current?.icon} />
          {current?.name ?? "Organization"}
          <ChevronDown size={14} />
        </span>
      }
    >
      {organizations.map((org) => (
        <Link
          key={org.id}
          href={`/organizations/${org.id}/projects`}
          className="rf-menu-item"
        >
          <OrgIconMark icon={org.icon} />
          {org.name}
        </Link>
      ))}
      <Link href="/organizations" className="rf-menu-item">
        All organizations
      </Link>
    </Dropdown>
  );
}
