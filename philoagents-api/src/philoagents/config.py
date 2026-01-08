from pathlib import Path

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
    LLM_MODEL_CONTEXT_SUMMARY: str = Field(
        default="llama-3.1-8b-instant",
        description="Model for RAG context summarization"
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
    MONGO_LONG_TERM_MEMORY_COLLECTION: str = "philosopher_long_term_memory"

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

    # --- RAG Configuration ---
    RAG_TEXT_EMBEDDING_MODEL_ID: str = "text-embedding-3-small"
    RAG_TEXT_EMBEDDING_MODEL_DIM: int = 1536
    RAG_TOP_K: int = 3
    RAG_DEVICE: str = "cpu"
    RAG_CHUNK_SIZE: int = 256

    # --- Paths Configuration ---
    EVALUATION_DATASET_FILE_PATH: Path = Path("data/evaluation_dataset.json")
    EXTRACTION_METADATA_FILE_PATH: Path = Path("data/extraction_metadata.json")


settings = Settings()
