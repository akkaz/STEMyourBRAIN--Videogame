from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from philoagents.application.conversation_service.workflow.tools import tools, victory_tools
from philoagents.application.llm_service.model_factory import (
    get_chat_model,
    get_context_summary_model,
    get_summary_model,
)
from philoagents.domain.prompts import (
    CONTEXT_SUMMARY_PROMPT,
    EXTEND_SUMMARY_PROMPT,
    PHILOSOPHER_CHARACTER_CARD,
    SUMMARY_PROMPT,
)


def get_philosopher_response_chain(philosopher_id: str = ""):
    """Create the main philosopher response chain with tool calling.

    Args:
        philosopher_id: The ID of the philosopher. If "nicolo", victory tools are included.
    """
    model = get_chat_model()

    # Nicolò gets access to the victory tool
    if philosopher_id == "nicolo":
        all_tools = tools + victory_tools
    else:
        all_tools = tools

    model = model.bind_tools(all_tools)
    system_message = PHILOSOPHER_CHARACTER_CARD

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_message.prompt),
            MessagesPlaceholder(variable_name="messages"),
        ],
        template_format="jinja2",
    )

    return prompt | model


def get_conversation_summary_chain(summary: str = ""):
    """Create chain for conversation summarization using optimized model."""
    model = get_summary_model()

    summary_message = EXTEND_SUMMARY_PROMPT if summary else SUMMARY_PROMPT

    prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="messages"),
            ("human", summary_message.prompt),
        ],
        template_format="jinja2",
    )

    return prompt | model


def get_context_summary_chain():
    """Create chain for RAG context summarization using optimized model."""
    model = get_context_summary_model()

    prompt = ChatPromptTemplate.from_messages(
        [
            ("human", CONTEXT_SUMMARY_PROMPT.prompt),
        ],
        template_format="jinja2",
    )

    return prompt | model