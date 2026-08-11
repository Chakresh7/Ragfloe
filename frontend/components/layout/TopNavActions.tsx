"use client";

import { CircleHelp, Lightbulb, Search } from "lucide-react";
import { UserMenu } from "./UserMenu";

type TopNavActionsProps = {
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

export function TopNavActions({ email, name, avatarUrl }: TopNavActionsProps) {
  return (
    <div className="app-topnav-right">
      <button type="button" className="topnav-text-btn" disabled title="Coming soon">
        Feedback
      </button>

      <button type="button" className="topnav-search" disabled title="Coming soon">
        <Search size={14} aria-hidden="true" />
        <span className="topnav-search-placeholder">Search...</span>
        <kbd className="topnav-kbd">Ctrl K</kbd>
      </button>

      <button
        type="button"
        className="topnav-icon-btn"
        aria-label="Help"
        disabled
        title="Coming soon"
      >
        <CircleHelp size={15} />
      </button>

      <button
        type="button"
        className="topnav-icon-btn"
        aria-label="Feature updates"
        disabled
        title="Coming soon"
      >
        <Lightbulb size={15} />
      </button>

      <UserMenu email={email} name={name} avatarUrl={avatarUrl} />
    </div>
  );
}
