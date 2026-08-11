"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { OrgCard } from "./OrgCard";
import { NewOrgDialog } from "./NewOrgDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiError } from "@/lib/api/client";
import { mapOrganization } from "@/lib/api/mappers";
import {
  createOrganization,
  listOrganizations,
} from "@/lib/api/organizations";
import type { Organization } from "@/lib/mock/types";

type OrganizationsViewProps = {
  initialOrganizations?: Organization[];
  initialError?: string | null;
};

export function OrganizationsView({
  initialOrganizations = [],
  initialError = null,
}: OrganizationsViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setOrganizations(initialOrganizations);
    setError(initialError);
  }, [initialOrganizations, initialError]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listOrganizations();
      setOrganizations(rows.map(mapOrganization));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load organizations.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter((org) => org.name.toLowerCase().includes(q));
  }, [organizations, query]);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const org = await createOrganization({ name });
      setOpen(false);
      setName("");
      router.push(`/organizations/${org.id}/projects`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create organization.";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Organizations</h1>
          <p className="app-page-subtitle">
            Choose an organization to manage RagFloe projects.
          </p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus size={14} />
          New organization
        </Button>
      </div>

      <div className="app-toolbar">
        <div className="app-toolbar-grow">
          <Input
            withSearchIcon
            placeholder="Search for an organization"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search organizations"
          />
        </div>
      </div>

      {error ? (
        <EmptyState
          title="Something went wrong"
          description={error}
          action={
            <Button variant="secondary" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
      ) : loading ? (
        <EmptyState title="Loading organizations" description="Fetching your orgs…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? "No organizations found" : "No organizations yet"}
          description={
            query
              ? "Try a different search term."
              : "Create an organization to start grouping RagFloe projects."
          }
          action={
            !query ? (
              <Button variant="primary" onClick={() => setOpen(true)}>
                <Plus size={14} />
                New organization
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="card-grid">
          {filtered.map((organization) => (
            <OrgCard key={organization.id} organization={organization} />
          ))}
        </div>
      )}

      <NewOrgDialog
        open={open}
        name={name}
        onNameChange={setName}
        onClose={() => setOpen(false)}
        onConfirm={() => void handleCreate()}
      />
    </>
  );
}
