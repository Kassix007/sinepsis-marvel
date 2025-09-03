from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    database_url: str = Field(..., alias="DATABASE_URL")
    ollama_host: str = Field("http://localhost:11434", alias="OLLAMA_HOST")
    generation_model: str = Field("gemini-2.5-flash", alias="GENERATION_MODEL")
    embedding_model: str = Field("nomic-embed-text", alias="EMBEDDING_MODEL")
    embedding_dim: int = Field(768, alias="EMBEDDING_DIM")
    gemini_api_key: str = Field(..., alias="GEMINI_API_KEY")

    @field_validator("database_url")
    @classmethod
    def normalize_db_url(cls, v: str) -> str:
        # Normalize postgres:// to postgresql+psycopg://
        if v.startswith("postgres://"):
            v = "postgresql+psycopg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://"):]
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
