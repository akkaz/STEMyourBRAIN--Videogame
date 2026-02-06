from pydantic import BaseModel, Field


class Philosopher(BaseModel):
    """A class representing a game character agent.

    Args:
        id (str): Unique identifier for the character.
        name (str): Name of the character.
        perspective (str): Description of the character's role and riddle.
        style (str): Description of the character's talking style.
    """

    id: str = Field(description="Unique identifier for the character")
    name: str = Field(description="Name of the character")
    perspective: str = Field(
        description="Description of the character's role and riddle"
    )
    style: str = Field(description="Description of the character's talking style")

    def __str__(self) -> str:
        return f"Philosopher(id={self.id}, name={self.name}, perspective={self.perspective}, style={self.style})"
