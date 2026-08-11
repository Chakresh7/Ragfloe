from app.core.config import get_settings
from sqlalchemy import create_engine, text

get_settings.cache_clear()
eng = create_engine(get_settings().database_url)
with eng.connect() as c:
    print("alembic_version:", c.execute(text("select * from alembic_version")).fetchall())
    rows = c.execute(
        text(
            "select table_schema, table_name from information_schema.tables "
            "where table_schema = 'public' order by table_name"
        )
    ).fetchall()
    print("tables:", rows)
