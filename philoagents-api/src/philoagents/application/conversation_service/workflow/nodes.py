from langchain_core.messages import RemoveMessage
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import ToolNode

from philoagents.application.conversation_service.workflow.chains import (
    get_conversation_summary_chain,
    get_philosopher_response_chain,
)
from philoagents.application.conversation_service.workflow.state import PhilosopherState
from philoagents.application.conversation_service.workflow.tools import victory_tools
from philoagents.config import settings

victory_node = ToolNode(victory_tools)


async def conversation_node(state: PhilosopherState, config: RunnableConfig):
    summary = state.get("summary", "")
    philosopher_id = state.get("philosopher_id", "")
    conversation_chain = get_philosopher_response_chain(philosopher_id=philosopher_id)

    response = await conversation_chain.ainvoke(
        {
            "messages": state["messages"],
            "philosopher_name": state["philosopher_name"],
            "philosopher_perspective": state["philosopher_perspective"],
            "philosopher_style": state["philosopher_style"],
            "summary": summary,
        },
        config,
    )

    # Check if victory tool was called
    result = {"messages": response}
    if hasattr(response, "tool_calls") and response.tool_calls:
        for tool_call in response.tool_calls:
            if tool_call.get("name") == "trigger_victory":
                result["game_event"] = "victory"
                break

    return result


async def summarize_conversation_node(state: PhilosopherState):
    summary = state.get("summary", "")
    summary_chain = get_conversation_summary_chain(summary)

    response = await summary_chain.ainvoke(
        {
            "messages": state["messages"],
            "philosopher_name": state["philosopher_name"],
            "summary": summary,
        }
    )

    delete_messages = [
        RemoveMessage(id=m.id)
        for m in state["messages"][: -settings.TOTAL_MESSAGES_AFTER_SUMMARY]
    ]
    return {"summary": response.content, "messages": delete_messages}


async def connector_node(state: PhilosopherState):
    return {}
