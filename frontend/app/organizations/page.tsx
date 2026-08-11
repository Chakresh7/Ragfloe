import { AppTopNav } from "@/components/layout/AppTopNav";
import { OrganizationsView } from "@/components/organizations/OrganizationsView";
import { ApiError } from "@/lib/api/client";
import { mapOrganization } from "@/lib/api/mappers";
import { serverApiFetch } from "@/lib/api/server";
import type { ApiOrganization } from "@/lib/api/types";
import { getServerAuthContext } from "@/lib/auth/server-user";
import type { Organization } from "@/lib/mock/types";

export default async function OrganizationsPage() {
  const auth = await getServerAuthContext();

  let organizations: Organization[] = [];
  let initialError: string | null = null;

  if (!auth) {
    initialError = "No active session. Sign in again.";
  } else {
    try {
      const rows = await serverApiFetch<ApiOrganization[]>(
        "/api/v1/organizations",
        { accessToken: auth.accessToken },
      );
      organizations = rows.map(mapOrganization);
    } catch (err) {
      initialError =
        err instanceof ApiError ? err.message : "Failed to load organizations.";
    }
  }

  return (
    <div className="app-shell">
      <AppTopNav
        email={auth?.user.email}
        name={auth?.user.name}
        avatarUrl={auth?.user.avatarUrl}
      />
      <div className="app-page">
        <OrganizationsView
          initialOrganizations={organizations}
          initialError={initialError}
        />
      </div>
    </div>
  );
}
