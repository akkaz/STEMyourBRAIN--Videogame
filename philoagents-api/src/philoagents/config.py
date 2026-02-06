from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", env_file_encoding="utf-8"
    )

    # --- LLM Provider Selection ---
    LLM_PROVIDER: str = Field(
        default="groq",
        description="LLM provider to use: 'groq', 'gemini', 'openai', 'anthropic'"
    )

    # --- Model Configuration ---
    LLM_MODEL: str = Field(
        default="llama-3.3-70b-versatile",
        description="Main model for conversations"
    )
    LLM_MODEL_SUMMARY: str = Field(
        default="llama-3.1-8b-instant",
        description="Model for conversation summarization"
    )
    # --- GROQ Configuration ---
    GROQ_API_KEY: str | None = None
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_LLM_MODEL_CONTEXT_SUMMARY: str = "llama-3.1-8b-instant"

    # --- Gemini Configuration ---
    GEMINI_API_KEY: str | None = None

    # --- OpenAI Configuration ---
    OPENAI_API_KEY: str | None = None

    # --- Anthropic Configuration ---
    ANTHROPIC_API_KEY: str | None = None

    # --- MongoDB Configuration ---
    MONGO_URI: str = Field(
        default="mongodb://philoagents:philoagents@local_dev_atlas:27017/?directConnection=true",
        description="Connection URI for the local MongoDB Atlas instance.",
    )
    MONGO_DB_NAME: str = "philoagents"
    MONGO_STATE_CHECKPOINT_COLLECTION: str = "philosopher_state_checkpoints"
    MONGO_STATE_WRITES_COLLECTION: str = "philosopher_state_writes"
    # --- Comet ML & Opik Configuration ---
    COMET_API_KEY: str | None = Field(
        default=None, description="API key for Comet ML and Opik services."
    )
    COMET_PROJECT: str = Field(
        default="philoagents_course",
        description="Project name for Comet ML and Opik tracking.",
    )
    PROMPT_VERSION: str = Field(
        default="v1",
        description="Version for prompt library in Opik. Change this to update prompts without rebuilding.",
    )

    # --- Agents Configuration ---
    TOTAL_MESSAGES_SUMMARY_TRIGGER: int = 30
    TOTAL_MESSAGES_AFTER_SUMMARY: int = 5



settings = Settings()
