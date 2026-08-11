"use client";

import {
  Building2,
  FlaskConical,
  LogOut,
  ScrollText,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Dropdown } from "@/components/ui/Dropdown";
import { createClient } from "@/lib/supabase/client";
import type { ThemePreference } from "@/lib/theme";

type UserMenuProps = {
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function UserMenu({ email, name, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const { preference, setPreference } = useTheme();
  const [busy, setBusy] = useState(false);
  const displayName = name || email?.split("@")[0] || "Account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <Dropdown
      panelClassName="user-menu-panel"
      trigger={
        <span className="user-menu-avatar-btn" aria-label="Account menu">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="user-menu-avatar-img"
              width={28}
              height={28}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="user-menu-avatar-fallback" aria-hidden="true">
              {initial}
            </span>
          )}
        </span>
      }
    >
      <div className="user-menu-header">
        <p className="user-menu-name">{displayName}</p>
        {email ? <p className="user-menu-email">{email}</p> : null}
      </div>

      <div className="user-menu-section">
        <Link href="/settings/account" className="rf-menu-item">
          <UserRound size={14} />
          Account
        </Link>
        <Link href="/organizations" className="rf-menu-item">
          <Building2 size={14} />
          Organizations
        </Link>
        <button type="button" className="rf-menu-item" disabled>
          <FlaskConical size={14} />
          Feature previews
        </button>
        <button type="button" className="rf-menu-item" disabled>
          <ScrollText size={14} />
          Changelog
        </button>
      </div>

      <div className="user-menu-section">
        <p className="user-menu-section-label">Theme</p>
        <div className="user-menu-theme" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={preference === option.value}
              className={`user-menu-theme-option${preference === option.value ? " is-active" : ""}`}
              onClick={() => setPreference(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="user-menu-section">
        <button type="button" className="user-menu-upgrade" disabled>
          Upgrade to Pro
        </button>
      </div>

      <div className="user-menu-section user-menu-section-last">
        <button
          type="button"
          className="rf-menu-item"
          onClick={() => void handleLogout()}
          disabled={busy}
        >
          <LogOut size={14} />
          {busy ? "Logging out…" : "Log out"}
        </button>
      </div>
    </Dropdown>
  );
}
