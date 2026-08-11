export type ApiOrganization = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  updated_at: string;
  project_count: number;
};

export type ApiProject = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ApiMember = {
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
  display_name: string | null;
  email: string | null;
};
