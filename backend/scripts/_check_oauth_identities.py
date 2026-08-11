"""Report OAuth identity linkage and duplicate-email risk in auth schema.

Read-only. Does not merge or modify accounts.
"""

from __future__ import annotations

from app.core.config import get_settings
from sqlalchemy import create_engine, text


def main() -> None:
    get_settings.cache_clear()
    engine = create_engine(get_settings().database_url)

    with engine.connect() as conn:
        users = conn.execute(
            text(
                """
                select id::text, email, raw_app_meta_data->>'providers' as providers
                from auth.users
                order by created_at
                """
            )
        ).mappings().all()

        identities = conn.execute(
            text(
                """
                select user_id::text,
                       provider,
                       identity_data->>'email' as email
                from auth.identities
                order by created_at
                """
            )
        ).mappings().all()

        duplicate_user_emails = conn.execute(
            text(
                """
                select email, count(*) as cnt
                from auth.users
                where email is not null
                group by email
                having count(*) > 1
                """
            )
        ).mappings().all()

        cross_user_identity_emails = conn.execute(
            text(
                """
                select lower(identity_data->>'email') as email,
                       count(distinct user_id) as user_cnt
                from auth.identities
                where identity_data->>'email' is not null
                group by lower(identity_data->>'email')
                having count(distinct user_id) > 1
                """
            )
        ).mappings().all()

        multi = conn.execute(
            text(
                """
                select user_id::text as user_id,
                       array_agg(provider order by provider) as providers
                from auth.identities
                group by user_id
                having count(*) > 1
                """
            )
        ).mappings().all()

    print(f"auth.users: {len(users)}")
    for row in users:
        print(f"  {row['id']}  {row['email']}  providers={row['providers']}")

    print(f"\nauth.identities: {len(identities)}")
    for row in identities:
        print(f"  user={row['user_id']}  {row['provider']}  {row['email']}")

    print("\nusers with multiple linked identities:")
    if multi:
        for row in multi:
            print(f"  {row['user_id']} -> {row['providers']}")
    else:
        print("  NONE")

    print("\nduplicate auth.users emails:")
    print(f"  {list(duplicate_user_emails) if duplicate_user_emails else 'NONE'}")

    print("\nsame identity email on different users (conflict risk):")
    print(
        f"  {list(cross_user_identity_emails) if cross_user_identity_emails else 'NONE'}"
    )


if __name__ == "__main__":
    main()
