from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organization import Organization, OrganizationMember
from app.models.project import Project
from app.services.auth_service import AuthenticatedUser


class OrgRole(StrEnum):
    OWNER = "owner"
    ADMIN = "admin"
    DEVELOPER = "developer"


ROLE_RANK = {
    OrgRole.DEVELOPER: 1,
    OrgRole.ADMIN: 2,
    OrgRole.OWNER: 3,
}


def _user_uuid(user: AuthenticatedUser) -> UUID:
    return UUID(user.id)


def get_membership(
    db: Session,
    organization_id: UUID,
    user_id: UUID,
) -> OrganizationMember | None:
    return (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id,
        )
        .one_or_none()
    )


def require_organization_member(
    organization_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationMember:
    membership = get_membership(db, organization_id, _user_uuid(user))
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )
    return membership


def require_organization_role(*allowed: OrgRole):
    allowed_set = set(allowed)

    def dependency(
        organization_id: UUID,
        user: AuthenticatedUser = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> OrganizationMember:
        membership = get_membership(db, organization_id, _user_uuid(user))
        if membership is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden",
            )
        try:
            role = OrgRole(membership.role)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden",
            ) from exc
        if role not in allowed_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden",
            )
        return membership

    return dependency


def require_project_access(
    project_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> tuple[Project, OrganizationMember]:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found",
        )
    membership = get_membership(db, project.organization_id, _user_uuid(user))
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )
    return project, membership


def role_at_least(membership: OrganizationMember, minimum: OrgRole) -> bool:
    try:
        role = OrgRole(membership.role)
    except ValueError:
        return False
    return ROLE_RANK[role] >= ROLE_RANK[minimum]
