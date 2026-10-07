import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "ReviewPilot AI Service"
    port: int = int(os.getenv("PORT", "8001"))
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    api_key: str = os.getenv("AI_SERVICE_API_KEY", "internal-key")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
