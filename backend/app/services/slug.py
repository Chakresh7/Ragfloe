import re
import unicodedata
from uuid import uuid4


def slugify(value: str, *, max_length: int = 100) -> str:
    normalized = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    slug = re.sub(r"-{2,}", "-", slug)
    if not slug:
        slug = "item"
    return slug[:max_length]


def unique_slug(base: str, exists) -> str:
    """exists(slug) -> bool"""
    candidate = slugify(base)
    if not exists(candidate):
        return candidate
    for _ in range(20):
        suffix = uuid4().hex[:6]
        next_candidate = f"{candidate[:90]}-{suffix}"
        if not exists(next_candidate):
            return next_candidate
    return f"{candidate[:80]}-{uuid4().hex}"
