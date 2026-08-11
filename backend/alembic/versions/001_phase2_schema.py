"""Create profiles, organizations, members, projects + RLS.

Revision ID: 001_phase2_schema
Revises:
Create Date: 2026-08-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_phase2_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("display_name", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["id"], ["auth.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("plan", sa.String(length=32), server_default="free", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "organization_members",
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("organization_id", "user_id"),
    )
    op.create_index(
        "ix_organization_members_organization_id",
        "organization_members",
        ["organization_id"],
    )
    op.create_index(
        "ix_organization_members_user_id",
        "organization_members",
        ["user_id"],
    )

    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=32),
            server_default="active",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "organization_id",
            "slug",
            name="uq_projects_organization_slug",
        ),
    )
    op.create_index("ix_projects_organization_id", "projects", ["organization_id"])

    # RLS — defense in depth (FastAPI uses privileged role and still authorizes)
    op.execute("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE organizations ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE projects ENABLE ROW LEVEL SECURITY")

    op.execute("ALTER TABLE profiles FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE organizations FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE organization_members FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE projects FORCE ROW LEVEL SECURITY")

    op.execute(
        """
        CREATE POLICY profiles_select_own ON profiles
        FOR SELECT TO authenticated
        USING (id = auth.uid())
        """
    )
    op.execute(
        """
        CREATE POLICY profiles_update_own ON profiles
        FOR UPDATE TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid())
        """
    )
    op.execute(
        """
        CREATE POLICY profiles_insert_own ON profiles
        FOR INSERT TO authenticated
        WITH CHECK (id = auth.uid())
        """
    )

    op.execute(
        """
        CREATE POLICY org_members_select ON organization_members
        FOR SELECT TO authenticated
        USING (
          user_id = auth.uid()
          OR organization_id IN (
            SELECT organization_id FROM organization_members om
            WHERE om.user_id = auth.uid()
          )
        )
        """
    )

    op.execute(
        """
        CREATE POLICY organizations_select_member ON organizations
        FOR SELECT TO authenticated
        USING (
          id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
          )
        )
        """
    )
    op.execute(
        """
        CREATE POLICY organizations_insert_authenticated ON organizations
        FOR INSERT TO authenticated
        WITH CHECK (true)
        """
    )
    op.execute(
        """
        CREATE POLICY organizations_update_admin ON organizations
        FOR UPDATE TO authenticated
        USING (
          id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
          )
        )
        """
    )
    op.execute(
        """
        CREATE POLICY organizations_delete_owner ON organizations
        FOR DELETE TO authenticated
        USING (
          id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'owner'
          )
        )
        """
    )

    op.execute(
        """
        CREATE POLICY org_members_insert_admin ON organization_members
        FOR INSERT TO authenticated
        WITH CHECK (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
          )
          OR user_id = auth.uid()
        )
        """
    )
    op.execute(
        """
        CREATE POLICY org_members_update_admin ON organization_members
        FOR UPDATE TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
          )
        )
        """
    )
    op.execute(
        """
        CREATE POLICY org_members_delete_admin ON organization_members
        FOR DELETE TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
          )
        )
        """
    )

    op.execute(
        """
        CREATE POLICY projects_select_member ON projects
        FOR SELECT TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
          )
        )
        """
    )
    op.execute(
        """
        CREATE POLICY projects_insert_member ON projects
        FOR INSERT TO authenticated
        WITH CHECK (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'developer')
          )
        )
        """
    )
    op.execute(
        """
        CREATE POLICY projects_update_member ON projects
        FOR UPDATE TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'developer')
          )
        )
        """
    )
    op.execute(
        """
        CREATE POLICY projects_delete_admin ON projects
        FOR DELETE TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
          )
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS projects_delete_admin ON projects")
    op.execute("DROP POLICY IF EXISTS projects_update_member ON projects")
    op.execute("DROP POLICY IF EXISTS projects_insert_member ON projects")
    op.execute("DROP POLICY IF EXISTS projects_select_member ON projects")
    op.execute("DROP POLICY IF EXISTS org_members_delete_admin ON organization_members")
    op.execute("DROP POLICY IF EXISTS org_members_update_admin ON organization_members")
    op.execute("DROP POLICY IF EXISTS org_members_insert_admin ON organization_members")
    op.execute("DROP POLICY IF EXISTS org_members_select ON organization_members")
    op.execute("DROP POLICY IF EXISTS organizations_delete_owner ON organizations")
    op.execute("DROP POLICY IF EXISTS organizations_update_admin ON organizations")
    op.execute(
        "DROP POLICY IF EXISTS organizations_insert_authenticated ON organizations"
    )
    op.execute("DROP POLICY IF EXISTS organizations_select_member ON organizations")
    op.execute("DROP POLICY IF EXISTS profiles_insert_own ON profiles")
    op.execute("DROP POLICY IF EXISTS profiles_update_own ON profiles")
    op.execute("DROP POLICY IF EXISTS profiles_select_own ON profiles")

    op.drop_index("ix_projects_organization_id", table_name="projects")
    op.drop_table("projects")
    op.drop_index("ix_organization_members_user_id", table_name="organization_members")
    op.drop_index(
        "ix_organization_members_organization_id",
        table_name="organization_members",
    )
    op.drop_table("organization_members")
    op.drop_table("organizations")
    op.drop_table("profiles")
