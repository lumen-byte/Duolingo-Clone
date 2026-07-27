from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='/app/backend/.env', extra='ignore')

    DATABASE_URL: str = 'sqlite+aiosqlite:////app/backend/duolingo.db'
    EMERGENT_LLM_KEY: str = ''
    AI_MODEL: str = 'gemini-2.0-flash'
    AI_PROVIDER: str = 'gemini'
    CORS_ORIGINS: str = '*'

settings = Settings()
