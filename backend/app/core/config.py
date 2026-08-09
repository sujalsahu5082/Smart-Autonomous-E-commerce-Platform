from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Smart Autonomous E-commerce Platform"
    debug: bool = False
    api_prefix: str = "/api"

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = "sqlite+aiosqlite:///./ecommerce.db"

    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"
    chroma_persist_dir: str = "./chroma_db"
    chroma_collection: str = "products"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
