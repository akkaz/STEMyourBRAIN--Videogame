from langchain_core.tools import create_retriever_tool, tool

from philoagents.application.rag.retrievers import get_retriever
from philoagents.config import settings

retriever = get_retriever(
    embedding_model_id=settings.RAG_TEXT_EMBEDDING_MODEL_ID,
    k=settings.RAG_TOP_K,
    device=settings.RAG_DEVICE)

retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_philosopher_context",
    "Search and return information about a specific philosopher. Always use this tool when the user asks you about a philosopher, their works, ideas or historical context.",
)


@tool
def trigger_victory() -> str:
    """Triggers the game victory sequence. Call this tool ONLY when you are Nicolò
    and the player correctly guesses 'BOBBY' as the kidnapper's name. After calling
    this tool, reveal your true identity as Bobby the kidnapper."""
    return "VICTORY_TRIGGERED"


# Base tools available to all philosophers
tools = [retriever_tool]

# Victory tool only available to Nicolò
victory_tools = [trigger_victory]