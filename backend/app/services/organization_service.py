from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.authorization import OrgRole
from app.models.organization import Organization, OrganizationMember
from app.models.profile import Profile
from app.models.project import Project
from app.schemas.organization import (
    MemberResponse,
    MemberUpdate,
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.auth_service import AuthenticatedUser
from app.services.profile_service import ensure_profile
from app.services.slug import unique_slug


def _org_response(org: Organization, project_count: int = 0) -> OrganizationResponse:
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        plan=org.plan,
        created_at=org.created_at,
        updated_at=org.updated_at,
        project_count=project_count,
    )


def list_organizations_for_user(
    db: Session,
    user: AuthenticatedUser,
) -> list[OrganizationResponse]:
    user_id = UUID(user.id)
    rows = (
        db.query(Organization, func.count(Project.id))
        .join(
            OrganizationMember,
            OrganizationMember.organization_id == Organization.id,
        )
        .outerjoin(Project, Project.organization_id == Organization.id)
        .filter(OrganizationMember.user_id == user_id)
        .group_by(Organization.id)
        .order_by(Organization.created_at.desc())
        .all()
    )
    return [_org_response(org, count) for org, count in rows]


def create_organization(
    db: Session,
    user: AuthenticatedUser,
    payload: OrganizationCreate,
) -> OrganizationResponse:
    ensure_profile(db, user)

    def slug_taken(slug: str) -> bool:
        return (
            db.query(Organization.id).filter(Organization.slug == slug).first()
            is not None
        )

    org = Organization(
        name=payload.name.strip(),
        slug=unique_slug(payload.name, slug_taken),
        plan=payload.plan.lower(),
    )
    db.add(org)
    db.flush()

    membership = OrganizationMember(
        organization_id=org.id,
        user_id=UUID(user.id),
        role=OrgRole.OWNER.value,
    )
    db.add(membership)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict",
        ) from exc
    db.refresh(org)
    return _org_response(org, 0)


def get_organization(
    db: Session,
    organization_id: UUID,
) -> OrganizationResponse:
    org = db.get(Organization, organization_id)
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    count = (
        db.query(func.count(Project.id))
        .filter(Project.organization_id == organization_id)
        .scalar()
        or 0
    )
    return _org_response(org, int(count))


def update_organization(
    db: Session,
    organization_id: UUID,
    payload: OrganizationUpdate,
) -> OrganizationResponse:
    org = db.get(Organization, organization_id)
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if payload.name is not None:
        org.name = payload.name.strip()
    if payload.plan is not None:
        org.plan = payload.plan.lower()

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict",
        ) from exc
    db.refresh(org)
    return get_organization(db, organization_id)


def delete_organization(db: Session, organization_id: UUID) -> None:
    org = db.get(Organization, organization_id)
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    db.delete(org)
    db.commit()


def list_members(db: Session, organization_id: UUID) -> list[MemberResponse]:
    rows = (
        db.query(OrganizationMember, Profile)
        .outerjoin(Profile, Profile.id == OrganizationMember.user_id)
        .filter(OrganizationMember.organization_id == organization_id)
        .order_by(OrganizationMember.created_at.asc())
        .all()
    )
    result: list[MemberResponse] = []
    for member, profile in rows:
        result.append(
            MemberResponse(
                organization_id=member.organization_id,
                user_id=member.user_id,
                role=member.role,
                created_at=member.created_at,
                display_name=profile.display_name if profile else None,
            )
        )
    return result


def update_member(
    db: Session,
    organization_id: UUID,
    target_user_id: UUID,
    payload: MemberUpdate,
    actor: AuthenticatedUser,
) -> MemberResponse:
    member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == target_user_id,
        )
        .one_or_none()
    )
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    new_role = payload.role
    if member.role == OrgRole.OWNER.value and new_role != OrgRole.OWNER.value:
        owner_count = (
            db.query(func.count(OrganizationMember.user_id))
            .filter(
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.role == OrgRole.OWNER.value,
            )
            .scalar()
            or 0
        )
        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conflict",
            )

    member.role = new_role
    db.commit()
    db.refresh(member)
    profile = db.get(Profile, target_user_id)
    return MemberResponse(
        organization_id=member.organization_id,
        user_id=member.user_id,
        role=member.role,
        created_at=member.created_at,
        display_name=profile.display_name if profile else None,
    )


def remove_member(
    db: Session,
    organization_id: UUID,
    target_user_id: UUID,
) -> None:
    member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == target_user_id,
        )
        .one_or_none()
    )
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if member.role == OrgRole.OWNER.value:
        owner_count = (
            db.query(func.count(OrganizationMember.user_id))
            .filter(
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.role == OrgRole.OWNER.value,
            )
            .scalar()
            or 0
        )
        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conflict",
            )

    db.delete(member)
    db.commit()
