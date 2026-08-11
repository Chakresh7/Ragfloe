import {
  Building2,
  FlaskConical,
  Hexagon,
  Landmark,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { OrgIcon } from "@/lib/mock/types";

export const ORG_ICONS: Record<OrgIcon, LucideIcon> = {
  building: Building2,
  flask: FlaskConical,
  hexagon: Hexagon,
  landmark: Landmark,
  layers: Layers,
};

const ICON_CYCLE: OrgIcon[] = [
  "building",
  "layers",
  "flask",
  "hexagon",
  "landmark",
];

export function getOrgIcon(icon?: OrgIcon | null): LucideIcon {
  return ORG_ICONS[icon ?? "building"] ?? Building2;
}

export function nextOrgIcon(existingCount: number): OrgIcon {
  return ICON_CYCLE[existingCount % ICON_CYCLE.length] ?? "building";
}
