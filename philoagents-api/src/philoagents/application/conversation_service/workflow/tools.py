from langchain_core.tools import tool


@tool
def trigger_victory() -> str:
    """Triggers the game victory sequence. Call this tool ONLY when you are Nicolò
    and the player correctly guesses 'BOBBY' as the kidnapper's name. After calling
    this tool, reveal your true identity as Bobby the kidnapper."""
    return "VICTORY_TRIGGERED"


# Victory tool only available to Nicolò
victory_tools = [trigger_victory]
