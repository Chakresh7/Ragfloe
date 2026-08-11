"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import type { ProjectStatus } from "@/lib/mock/types";

type ProjectToolbarProps = {
  query: string;
  statuses: ProjectStatus[];
  sort: "name" | "updated";
  view: "grid" | "list";
  onQueryChange: (value: string) => void;
  onStatusesChange: (value: ProjectStatus[]) => void;
  onSortChange: (value: "name" | "updated") => void;
  onViewChange: (value: "grid" | "list") => void;
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

export function ProjectToolbar({
  query,
  statuses,
  sort,
  view,
  onQueryChange,
  onStatusesChange,
  onSortChange,
  onViewChange,
}: ProjectToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState<ProjectStatus[]>(statuses);

  useEffect(() => {
    if (statusOpen) setDraftStatuses(statuses);
  }, [statusOpen, statuses]);

  function toggleDraft(status: ProjectStatus) {
    setDraftStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  function clearStatuses() {
    setDraftStatuses([]);
    onStatusesChange([]);
    setStatusOpen(false);
  }

  function saveStatuses() {
    onStatusesChange(draftStatuses);
    setStatusOpen(false);
  }

  const statusLabel =
    statuses.length === 0
      ? "Status"
      : statuses.length === 1
        ? STATUS_OPTIONS.find((item) => item.value === statuses[0])?.label ??
          "Status"
        : `Status (${statuses.length})`;

  const sortLabel =
    sort === "name" ? "Sorted by name" : "Sorted by last updated";

  return (
    <div className="app-toolbar">
      <div className="app-toolbar-grow">
        <Input
          withSearchIcon
          placeholder="Search for a project"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search projects"
        />
      </div>
      <div className="app-toolbar-actions">
        <Dropdown
          align="left"
          open={statusOpen}
          onOpenChange={setStatusOpen}
          panelClassName="filter-popover"
          trigger={
            <span
              className={`filter-trigger${statusOpen || statuses.length > 0 ? " is-active" : ""}`}
            >
              {statusLabel}
              <ChevronDown size={14} />
            </span>
          }
        >
          <div className="filter-popover-header">Filter projects by status</div>
          <div className="filter-popover-body">
            {STATUS_OPTIONS.map((option) => {
              const checked = draftStatuses.includes(option.value);
              return (
                <label key={option.value} className="filter-check">
                  <span className={`filter-checkbox${checked ? " is-checked" : ""}`}>
                    {checked ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDraft(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
          <div className="filter-popover-footer">
            <Button type="button" variant="secondary" onClick={clearStatuses}>
              Clear
            </Button>
            <Button type="button" variant="primary" onClick={saveStatuses}>
              Save
            </Button>
          </div>
        </Dropdown>

        <Dropdown
          align="left"
          open={sortOpen}
          onOpenChange={setSortOpen}
          panelClassName="filter-popover filter-popover-sort"
          trigger={
            <span className={`filter-trigger${sortOpen ? " is-active" : ""}`}>
              <ArrowDownWideNarrow size={14} />
              {sortLabel}
              <ChevronDown size={14} />
            </span>
          }
        >
          <div className="filter-popover-header">Sort projects</div>
          <div className="filter-popover-body">
            <button
              type="button"
              className={`filter-option${sort === "updated" ? " is-selected" : ""}`}
              onClick={() => {
                onSortChange("updated");
                setSortOpen(false);
              }}
            >
              Last updated
              {sort === "updated" ? <Check size={14} /> : null}
            </button>
            <button
              type="button"
              className={`filter-option${sort === "name" ? " is-selected" : ""}`}
              onClick={() => {
                onSortChange("name");
                setSortOpen(false);
              }}
            >
              Name
              {sort === "name" ? <Check size={14} /> : null}
            </button>
          </div>
        </Dropdown>

        <div className="view-toggle" role="group" aria-label="View mode">
          <Button
            variant="ghost"
            iconOnly
            className={view === "grid" ? "rf-btn-active" : ""}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid size={14} />
          </Button>
          <Button
            variant="ghost"
            iconOnly
            className={view === "list" ? "rf-btn-active" : ""}
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
          >
            <List size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
