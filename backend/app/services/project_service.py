from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.slug import unique_slug


def _to_response(project: Project) -> ProjectResponse:
    return ProjectResponse.model_validate(project)


def list_projects(db: Session, organization_id: UUID) -> list[ProjectResponse]:
    projects = (
        db.query(Project)
        .filter(Project.organization_id == organization_id)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [_to_response(p) for p in projects]


def create_project(
    db: Session,
    organization_id: UUID,
    payload: ProjectCreate,
) -> ProjectResponse:
    def slug_taken(slug: str) -> bool:
        return (
            db.query(Project.id)
            .filter(
                Project.organization_id == organization_id,
                Project.slug == slug,
            )
            .first()
            is not None
        )

    project = Project(
        organization_id=organization_id,
        name=payload.name.strip(),
        slug=unique_slug(payload.name, slug_taken),
        description=(payload.description or "").strip() or None,
        status=payload.status,
    )
    db.add(project)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict",
        ) from exc
    db.refresh(project)
    return _to_response(project)


def get_project(db: Session, project_id: UUID) -> ProjectResponse:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _to_response(project)


def update_project(
    db: Session,
    project: Project,
    payload: ProjectUpdate,
) -> ProjectResponse:
    if payload.name is not None:
        project.name = payload.name.strip()
    if payload.description is not None:
        project.description = payload.description.strip() or None
    if payload.status is not None:
        project.status = payload.status

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict",
        ) from exc
    db.refresh(project)
    return _to_response(project)


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()
