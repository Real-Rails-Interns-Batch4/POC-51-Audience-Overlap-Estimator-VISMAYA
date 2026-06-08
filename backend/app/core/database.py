import duckdb
from contextlib import contextmanager
from app.core.config import settings

@contextmanager
def get_db():
    """
    Context manager that yields a DuckDB connection and ensures it is closed after use.
    """
    conn = duckdb.connect(database=settings.DATABASE_PATH, read_only=False)
    try:
        yield conn
    finally:
        conn.close()
