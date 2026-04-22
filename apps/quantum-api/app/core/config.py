from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="QUANTUM_API_")

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    database_url: str = (
        "postgresql+psycopg://quantum:quantum@127.0.0.1:5432/quantum_ops"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
