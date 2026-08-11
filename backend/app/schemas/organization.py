from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    plan: str = Field(default="free", pattern="^(free|pro|team)$")


class OrganizationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    plan: str | None = Field(default=None, pattern="^(free|pro|team)$")


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    plan: str
    created_at: datetime
    updated_at: datetime
    project_count: int = 0


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    organization_id: UUID
    user_id: UUID
    role: str
    created_at: datetime
    display_name: str | None = None
    email: str | None = None


class MemberUpdate(BaseModel):
    role: str = Field(pattern="^(owner|admin|developer)$")
