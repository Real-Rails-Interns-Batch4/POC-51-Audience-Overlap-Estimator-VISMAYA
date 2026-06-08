from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Audience Overlap Estimator"
    API_V1_STR: str = "/api"
    
    # DuckDB file path. If empty, runs in-memory.
    DATABASE_PATH: str = "data.db"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
