from langchain_openai import OpenAIEmbeddings

EmbeddingsModel = OpenAIEmbeddings


def get_embedding_model(
    model_id: str = "text-embedding-3-small",
    device: str = "cpu",
) -> EmbeddingsModel:
    """Gets an instance of an OpenAI embedding model.

    Args:
        model_id (str): The ID/name of the OpenAI embedding model to use.
            Defaults to "text-embedding-3-small" (cheapest, good quality).
            Other options: "text-embedding-3-large" (better quality, more expensive)
        device (str): Deprecated parameter, kept for backwards compatibility.
            OpenAI embeddings run in the cloud, not locally.

    Returns:
        EmbeddingsModel: A configured OpenAI embeddings model instance
    """
    return OpenAIEmbeddings(model=model_id)
