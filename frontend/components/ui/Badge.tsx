import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
};

const toneClass = {
  default: "",
  success: "rf-badge-success",
  warning: "rf-badge-warning",
  muted: "rf-badge-muted",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return <span className={`rf-badge ${toneClass[tone]}`.trim()}>{children}</span>;
}
