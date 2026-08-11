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

export function OrgSwitcher({ organizations, currentId }: OrgSwitcherProps) {
  const current = organizations.find((org) => org.id === currentId);
  const CurrentIcon = getOrgIcon(current?.icon);

  return (
    <Dropdown
      align="left"
      trigger={
        <span className="switcher-btn">
          <CurrentIcon size={14} strokeWidth={1.75} />
          {current?.name ?? "Organization"}
          <ChevronDown size={14} />
        </span>
      }
    >
      {organizations.map((org) => {
        const Icon = getOrgIcon(org.icon);
        return (
          <Link
            key={org.id}
            href={`/organizations/${org.id}/projects`}
            className="rf-menu-item"
          >
            <Icon size={14} strokeWidth={1.75} />
            {org.name}
          </Link>
        );
      })}
      <Link href="/organizations" className="rf-menu-item">
        All organizations
      </Link>
    </Dropdown>
  );
}
