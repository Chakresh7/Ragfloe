from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.auth import MeResponse
from app.services.auth_service import AuthenticatedUser

router = APIRouter(tags=["auth"])


@router.get("/me", response_model=MeResponse)
def read_me(user: AuthenticatedUser = Depends(get_current_user)) -> MeResponse:
    return MeResponse(id=user.id, email=user.email)
