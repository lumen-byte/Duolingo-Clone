from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='/app/backend/.env', extra='ignore')

    DATABASE_URL: str = 'sqlite+aiosqlite:////app/backend/duolingo.db'
    GROQ_API_KEY: str = ''
    AI_MODEL: str = 'llama3-8b-8192'
    AI_PROVIDER: str = 'groq'
    CORS_ORIGINS: str = '*'

settings = Settings()
