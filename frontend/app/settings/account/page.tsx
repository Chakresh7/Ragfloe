import { AppTopNav } from "@/components/layout/AppTopNav";
import { ConnectedAccounts } from "@/components/settings/ConnectedAccounts";
import { BackendIdentity } from "@/components/auth/BackendIdentity";
import {
  getIdentityLinkErrorMessage,
  providerLabel,
} from "@/lib/auth/identities";
import { getServerAuthContext } from "@/lib/auth/server-user";
import { createClient } from "@/lib/supabase/server";

type AccountSettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    error_code?: string;
    linked?: string;
  }>;
};

export default async function AccountSettingsPage({
  searchParams,
}: AccountSettingsPageProps) {
  const params = await searchParams;
  const auth = await getServerAuthContext();

  const supabase = await createClient();
  const { data: identitiesData } = await supabase.auth.getUserIdentities();

  const successMessage = params.linked
    ? `${providerLabel(params.linked)} connected to this account.`
    : null;

  const errorMessage =
    getIdentityLinkErrorMessage(params.error_code) ??
    getIdentityLinkErrorMessage(params.error);

  const initialIdentities = (identitiesData?.identities ?? []).map(
    (identity) => ({
      identity_id: identity.identity_id,
      provider: identity.provider,
      email:
        typeof identity.identity_data?.email === "string"
          ? identity.identity_data.email
          : null,
    }),
  );

  return (
    <div className="app-shell">
      <AppTopNav
        email={auth?.user.email}
        name={auth?.user.name}
        avatarUrl={auth?.user.avatarUrl}
      />
      <div className="app-page settings-page">
        <header className="app-page-header">
          <div>
            <p className="app-eyebrow">Settings</p>
            <h1 className="app-page-title">Account</h1>
            <p className="app-page-subtitle">
              Signed in as {auth?.user.email ?? "unknown"}. Connect Google and
              GitHub to this same user — linking never merges two existing
              accounts.
            </p>
          </div>
        </header>

        <ConnectedAccounts
          initialIdentities={initialIdentities}
          accountEmail={auth?.user.email ?? null}
          initialMessage={successMessage}
          initialError={errorMessage}
        />

        <BackendIdentity />
      </div>
    </div>
  );
}
