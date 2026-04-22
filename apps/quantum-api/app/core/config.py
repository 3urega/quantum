from pydantic import Field, field_validator
from pydantic.aliases import AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="QUANTUM_API_")

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    database_url: str = Field(
        default="postgresql+psycopg://quantum:quantum@127.0.0.1:5432/quantum_ops",
        validation_alias=AliasChoices(
            "DATABASE_URL",
            "QUANTUM_API_DATABASE_URL",
        ),
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def ensure_psycopg3_dialect(cls, v: str) -> str:
        """Rewrite the database URL dialect to psycopg (v3).

        Railway and other platforms may inject a DATABASE_URL that uses the
        bare ``postgresql://`` scheme or the ``postgresql+psycopg2://`` dialect.
        Both are incompatible with the installed psycopg v3 driver.  This
        validator normalises any postgresql URL to ``postgresql+psycopg://``
        so SQLAlchemy always uses the correct driver.
        """
        replacements = [
            ("postgresql+psycopg2://", "postgresql+psycopg://"),
            ("postgres+psycopg2://", "postgresql+psycopg://"),
            # Bare schemes emitted by Railway / Heroku style DATABASE_URL
            ("postgresql://", "postgresql+psycopg://"),
            ("postgres://", "postgresql+psycopg://"),
        ]
        for old, new in replacements:
            if v.startswith(old):
                return new + v[len(old):]
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
