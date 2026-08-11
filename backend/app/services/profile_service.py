from uuid import UUID

from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.services.auth_service import AuthenticatedUser


def ensure_profile(db: Session, user: AuthenticatedUser) -> Profile:
    user_id = UUID(user.id)
    profile = db.get(Profile, user_id)
    if profile is not None:
        return profile

    display_name = None
    if user.email:
        display_name = user.email.split("@")[0]

    profile = Profile(
        id=user_id,
        display_name=display_name,
        avatar_url=None,
    )
    db.add(profile)
    db.flush()
    return profile
