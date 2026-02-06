"""Factory for creating LangChain chat models from different providers."""

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

from philoagents.config import settings


def get_chat_model(
    temperature: float = 0.7,
    model_name: str | None = None,
    provider: str | None = None,
) -> BaseChatModel:
    """
    Create a chat model instance based on configured provider.

    Args:
        temperature: Sampling temperature (0.0 to 1.0)
        model_name: Override default model name for the provider
        provider: Override default provider (groq, gemini, openai, anthropic)

    Returns:
        BaseChatModel: LangChain chat model instance

    Raises:
        ValueError: If provider is unknown or API key is missing
    """
    provider = provider or settings.LLM_PROVIDER
    model_name = model_name or settings.LLM_MODEL

    match provider.lower():
        case "groq":
            if not settings.GROQ_API_KEY:
                raise ValueError(
                    "GROQ_API_KEY is not set in environment. "
                    "Please add it to your .env file."
                )
            return ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model_name=model_name,
                temperature=temperature,
            )

        case "gemini":
            if not settings.GEMINI_API_KEY:
                raise ValueError(
                    "GEMINI_API_KEY is not set in environment. "
                    "Please add it to your .env file."
                )
            return ChatGoogleGenerativeAI(
                api_key=settings.GEMINI_API_KEY,
                model=model_name,
                temperature=temperature,
            )

        case "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError(
                    "OPENAI_API_KEY is not set in environment. "
                    "Please add it to your .env file."
                )
            return ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                model=model_name,
                temperature=temperature,
            )

        case "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError(
                    "ANTHROPIC_API_KEY is not set in environment. "
                    "Please add it to your .env file."
                )
            return ChatAnthropic(
                api_key=settings.ANTHROPIC_API_KEY,
                model=model_name,
                temperature=temperature,
            )

        case _:
            raise ValueError(
                f"Unknown provider: {provider}. "
                f"Supported providers: groq, gemini, openai, anthropic"
            )


def get_summary_model(temperature: float = 0.7) -> BaseChatModel:
    """
    Get a chat model optimized for summarization (usually faster/cheaper).

    Args:
        temperature: Sampling temperature (0.0 to 1.0)

    Returns:
        BaseChatModel: LangChain chat model instance for summarization
    """
    return get_chat_model(
        temperature=temperature,
        model_name=settings.LLM_MODEL_SUMMARY,
    )


