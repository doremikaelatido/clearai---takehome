from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    VITE_API_BASE_URL: str
    SMTP_ENABLED: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
