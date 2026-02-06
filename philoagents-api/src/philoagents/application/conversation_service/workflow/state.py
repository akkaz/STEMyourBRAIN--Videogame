from langgraph.graph import MessagesState


class PhilosopherState(MessagesState):
    """State class for the LangGraph workflow. It keeps track of the information necessary to maintain a coherent
    conversation between the Philosopher and the user.

    Attributes:
        philosopher_id (str): The unique identifier of the philosopher.
        philosopher_context (str): The historical and philosophical context of the philosopher.
        philosopher_name (str): The name of the philosopher.
        philosopher_perspective (str): The perspective of the philosopher about AI.
        philosopher_style (str): The style of the philosopher.
        summary (str): A summary of the conversation. This is used to reduce the token usage of the model.
        game_event (str | None): Game event triggered by the conversation (e.g., "victory").
    """

    philosopher_id: str = ""
    philosopher_name: str = ""
    philosopher_perspective: str = ""
    philosopher_style: str = ""
    summary: str = ""
    game_event: str | None = None
