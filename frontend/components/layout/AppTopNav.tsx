import Link from "next/link";
import type { ReactNode } from "react";
import { TopNavActions } from "./TopNavActions";

type AppTopNavProps = {
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  leftSlot?: ReactNode;
};

export function AppTopNav({ email, name, avatarUrl, leftSlot }: AppTopNavProps) {
  return (
    <header className="app-topnav">
      <div className="app-topnav-left">
        <Link href="/organizations" className="app-brand">
          RagFloe
        </Link>
        {leftSlot}
      </div>
      <TopNavActions email={email} name={name} avatarUrl={avatarUrl} />
    </header>
  );
}
