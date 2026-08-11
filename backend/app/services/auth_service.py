from dataclasses import dataclass
import logging
from functools import lru_cache

import jwt
from jwt import PyJWKClient
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError, PyJWKClientError

from app.core.config import get_settings

logger = logging.getLogger(__name__)

ASYMMETRIC_ALGORITHMS = {"ES256", "RS256"}


class AuthenticationError(Exception):
    """Raised when a Supabase access token cannot be verified."""


@dataclass(frozen=True, slots=True)
class AuthenticatedUser:
    id: str
    email: str | None


@lru_cache
def _get_jwks_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(jwks_url, cache_keys=True)


def _issuer(supabase_url: str) -> str:
    return f"{supabase_url.rstrip('/')}/auth/v1"


def _decode_asymmetric(token: str, supabase_url: str) -> dict:
    jwks_url = f"{_issuer(supabase_url)}/.well-known/jwks.json"
    signing_key = _get_jwks_client(jwks_url).get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256", "RS256"],
        audience="authenticated",
        issuer=_issuer(supabase_url),
        options={"require": ["exp", "sub"]},
    )


def _decode_hs256(token: str, secret: str) -> dict:
    return jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        audience="authenticated",
        options={"require": ["exp", "sub"]},
    )


def verify_access_token(token: str) -> AuthenticatedUser:
    """Verify a Supabase access token and return the authenticated user."""
    if not token or not token.strip():
        logger.info("Authentication failed: missing token")
        raise AuthenticationError("Unauthorized")

    settings = get_settings()

    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
    except InvalidTokenError:
        logger.info("Authentication failed: invalid or expired token")
        raise AuthenticationError("Unauthorized") from None

    try:
        if algorithm in ASYMMETRIC_ALGORITHMS:
            payload = _decode_asymmetric(token, settings.supabase_url)
        elif algorithm == "HS256":
            secret = settings.supabase_jwt_secret
            if not secret:
                logger.error(
                    "Authentication failed: SUPABASE_JWT_SECRET is not configured"
                )
                raise AuthenticationError("Unauthorized")
            payload = _decode_hs256(token, secret)
        else:
            logger.info("Authentication failed: invalid or expired token")
            raise AuthenticationError("Unauthorized")
    except ExpiredSignatureError:
        logger.info("Authentication failed: invalid or expired token")
        raise AuthenticationError("Unauthorized") from None
    except (InvalidTokenError, PyJWKClientError):
        logger.info("Authentication failed: invalid or expired token")
        raise AuthenticationError("Unauthorized") from None

    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        logger.info("Authentication failed: invalid or expired token")
        raise AuthenticationError("Unauthorized")

    email = payload.get("email")
    if email is not None and not isinstance(email, str):
        email = None

    return AuthenticatedUser(id=user_id, email=email)
