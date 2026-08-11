from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.authorization import (
    OrgRole,
    require_organization_member,
    require_organization_role,
    require_project_access,
    role_at_least,
)
from app.core.database import get_db
from app.models.organization import OrganizationMember
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services import project_service

org_projects_router = APIRouter(
    prefix="/organizations/{organization_id}/projects",
    tags=["projects"],
)
projects_router = APIRouter(prefix="/projects", tags=["projects"])


@org_projects_router.get("", response_model=list[ProjectResponse])
def list_projects(
    organization_id: UUID,
    _: OrganizationMember = Depends(require_organization_member),
    db: Session = Depends(get_db),
) -> list[ProjectResponse]:
    return project_service.list_projects(db, organization_id)


@org_projects_router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    organization_id: UUID,
    payload: ProjectCreate,
    _: OrganizationMember = Depends(
        require_organization_role(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.DEVELOPER)
    ),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    return project_service.create_project(db, organization_id, payload)


@projects_router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    access: tuple[Project, OrganizationMember] = Depends(require_project_access),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project, _ = access
    return project_service.get_project(db, project.id)


@projects_router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    payload: ProjectUpdate,
    access: tuple[Project, OrganizationMember] = Depends(require_project_access),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project, membership = access
    if not role_at_least(membership, OrgRole.DEVELOPER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return project_service.update_project(db, project, payload)


@projects_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    access: tuple[Project, OrganizationMember] = Depends(require_project_access),
    db: Session = Depends(get_db),
) -> None:
    project, membership = access
    if not role_at_least(membership, OrgRole.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    project_service.delete_project(db, project)
