from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.authorization import (
    OrgRole,
    require_organization_member,
    require_organization_role,
)
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organization import OrganizationMember
from app.schemas.organization import (
    MemberResponse,
    MemberUpdate,
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services import organization_service
from app.services.auth_service import AuthenticatedUser

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=list[OrganizationResponse])
def list_organizations(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OrganizationResponse]:
    return organization_service.list_organizations_for_user(db, user)


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organization(
    payload: OrganizationCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    return organization_service.create_organization(db, user, payload)


@router.get("/{organization_id}", response_model=OrganizationResponse)
def get_organization(
    organization_id: UUID,
    _: OrganizationMember = Depends(require_organization_member),
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    return organization_service.get_organization(db, organization_id)


@router.patch("/{organization_id}", response_model=OrganizationResponse)
def update_organization(
    organization_id: UUID,
    payload: OrganizationUpdate,
    _: OrganizationMember = Depends(
        require_organization_role(OrgRole.OWNER, OrgRole.ADMIN)
    ),
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    return organization_service.update_organization(db, organization_id, payload)


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    organization_id: UUID,
    _: OrganizationMember = Depends(require_organization_role(OrgRole.OWNER)),
    db: Session = Depends(get_db),
) -> None:
    organization_service.delete_organization(db, organization_id)


@router.get("/{organization_id}/members", response_model=list[MemberResponse])
def list_members(
    organization_id: UUID,
    _: OrganizationMember = Depends(require_organization_member),
    db: Session = Depends(get_db),
) -> list[MemberResponse]:
    return organization_service.list_members(db, organization_id)


@router.patch(
    "/{organization_id}/members/{user_id}",
    response_model=MemberResponse,
)
def update_member(
    organization_id: UUID,
    user_id: UUID,
    payload: MemberUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
    _: OrganizationMember = Depends(
        require_organization_role(OrgRole.OWNER, OrgRole.ADMIN)
    ),
    db: Session = Depends(get_db),
) -> MemberResponse:
    return organization_service.update_member(
        db,
        organization_id,
        user_id,
        payload,
        user,
    )


@router.delete(
    "/{organization_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_member(
    organization_id: UUID,
    user_id: UUID,
    _: OrganizationMember = Depends(
        require_organization_role(OrgRole.OWNER, OrgRole.ADMIN)
    ),
    db: Session = Depends(get_db),
) -> None:
    organization_service.remove_member(db, organization_id, user_id)
