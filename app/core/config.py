from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ClearAI EDI Service"
    DATABASE_URL: str = "sqlite:///./app.db"
    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SMTP_ENABLED: bool = False

    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
