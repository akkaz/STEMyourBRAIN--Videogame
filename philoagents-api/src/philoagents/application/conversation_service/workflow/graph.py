from functools import lru_cache
from typing import Literal

from langchain_core.messages import AIMessage
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import tools_condition

from philoagents.application.conversation_service.workflow.edges import (
    should_summarize_conversation,
)
from philoagents.application.conversation_service.workflow.nodes import (
    conversation_node,
    summarize_conversation_node,
    retriever_node,
    victory_node,
    summarize_context_node,
    connector_node,
)
from philoagents.application.conversation_service.workflow.state import PhilosopherState


def route_tools(state: PhilosopherState) -> Literal["retrieve_philosopher_context", "victory_node", "connector_node"]:
    """Route to the appropriate tool node based on the tool call."""
    messages = state.get("messages", [])
    if not messages:
        return "connector_node"

    last_message = messages[-1]
    if not isinstance(last_message, AIMessage) or not hasattr(last_message, "tool_calls"):
        return "connector_node"

    if not last_message.tool_calls:
        return "connector_node"

    # Check which tool was called
    for tool_call in last_message.tool_calls:
        tool_name = tool_call.get("name", "")
        if tool_name == "trigger_victory":
            return "victory_node"
        if tool_name == "retrieve_philosopher_context":
            return "retrieve_philosopher_context"

    return "connector_node"


@lru_cache(maxsize=1)
def create_workflow_graph():
    graph_builder = StateGraph(PhilosopherState)

    # Add all nodes
    graph_builder.add_node("conversation_node", conversation_node)
    graph_builder.add_node("retrieve_philosopher_context", retriever_node)
    graph_builder.add_node("victory_node", victory_node)
    graph_builder.add_node("summarize_conversation_node", summarize_conversation_node)
    graph_builder.add_node("summarize_context_node", summarize_context_node)
    graph_builder.add_node("connector_node", connector_node)

    # Define the flow
    graph_builder.add_edge(START, "conversation_node")
    graph_builder.add_conditional_edges(
        "conversation_node",
        route_tools,
        {
            "retrieve_philosopher_context": "retrieve_philosopher_context",
            "victory_node": "victory_node",
            "connector_node": "connector_node"
        }
    )
    graph_builder.add_edge("retrieve_philosopher_context", "summarize_context_node")
    graph_builder.add_edge("summarize_context_node", "conversation_node")
    # After victory tool executes, go back to conversation for the reveal message
    graph_builder.add_edge("victory_node", "conversation_node")
    graph_builder.add_conditional_edges("connector_node", should_summarize_conversation)
    graph_builder.add_edge("summarize_conversation_node", END)

    return graph_builder


# Compiled without a checkpointer. Used for LangGraph Studio
graph = create_workflow_graph().compile()
