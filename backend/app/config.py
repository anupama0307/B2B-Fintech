from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL:  str = "sqlite: ///./riskon. db"
    ADMIN_EMAIL: str = "admin@riskon.com"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config: 
        env_file = ".env"

settings = Settings()