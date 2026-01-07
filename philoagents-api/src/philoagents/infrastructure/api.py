from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from opik.integrations.langchain import OpikTracer
from pydantic import BaseModel

from philoagents.application.conversation_service.generate_response import (
    get_response,
    get_streaming_response,
)
from philoagents.application.conversation_service.reset_conversation import (
    reset_conversation_state,
)
from philoagents.domain.philosopher_factory import PhilosopherFactory

from .opik_utils import configure

configure()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events for the API."""
    # Startup code (if any) goes here
    yield
    # Shutdown code goes here
    opik_tracer = OpikTracer()
    opik_tracer.flush()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/debug/prompt-config")
async def debug_prompt_config():
    """Debug endpoint to check prompt configuration"""
    from philoagents.config import settings
    from philoagents.domain.prompts import (
        PHILOSOPHER_CHARACTER_CARD,
        SUMMARY_PROMPT,
        EXTEND_SUMMARY_PROMPT,
        CONTEXT_SUMMARY_PROMPT,
    )

    return {
        "prompt_version_env": settings.PROMPT_VERSION,
        "prompts": {
            "philosopher_character_card": {
                "name": PHILOSOPHER_CHARACTER_CARD.name,
                "content_preview": str(PHILOSOPHER_CHARACTER_CARD)[:200] + "...",
                "content_length": len(str(PHILOSOPHER_CHARACTER_CARD)),
            },
            "summary_prompt": {
                "name": SUMMARY_PROMPT.name,
                "content_preview": str(SUMMARY_PROMPT)[:200] + "...",
            },
        }
    }


@app.get("/models/current")
async def get_current_model():
    """Get currently configured LLM provider and models."""
    from philoagents.config import settings

    return {
        "provider": settings.LLM_PROVIDER,
        "models": {
            "main": settings.LLM_MODEL,
            "summary": settings.LLM_MODEL_SUMMARY,
            "context_summary": settings.LLM_MODEL_CONTEXT_SUMMARY,
        }
    }


@app.get("/models/available")
async def list_available_providers():
    """List all available LLM providers and their configuration status."""
    from philoagents.config import settings

    providers = {
        "groq": {
            "configured": bool(settings.GROQ_API_KEY),
            "default_models": {
                "main": "llama-3.3-70b-versatile",
                "summary": "llama-3.1-8b-instant",
            },
            "description": "Fast inference with Llama models (free tier available)"
        },
        "gemini": {
            "configured": bool(settings.GEMINI_API_KEY),
            "default_models": {
                "main": "gemini-2.0-flash-exp",
                "summary": "gemini-1.5-flash",
            },
            "description": "Google's Gemini models"
        },
        "openai": {
            "configured": bool(settings.OPENAI_API_KEY),
            "default_models": {
                "main": "gpt-4o",
                "summary": "gpt-4o-mini",
            },
            "description": "OpenAI GPT models"
        },
        "anthropic": {
            "configured": bool(settings.ANTHROPIC_API_KEY),
            "default_models": {
                "main": "claude-3-5-sonnet-20241022",
                "summary": "claude-3-5-haiku-20241022",
            },
            "description": "Anthropic Claude models"
        },
    }

    return {
        "current": settings.LLM_PROVIDER,
        "providers": providers
    }


@app.post("/models/test")
async def test_model_provider(provider: str, model: str | None = None):
    """
    Test if a provider is working correctly.

    Args:
        provider: Provider name (groq, gemini, openai, anthropic)
        model: Optional specific model name to test

    Returns:
        Test results including a sample response

    Raises:
        HTTPException: If the provider test fails
    """
    from philoagents.application.llm_service.model_factory import get_chat_model
    from langchain_core.messages import HumanMessage

    try:
        # Create model instance
        chat_model = get_chat_model(
            temperature=0.7,
            model_name=model,
            provider=provider
        )

        # Test with simple Italian message (since prompts are in Italian)
        test_message = HumanMessage(content="Rispondi con 'Ciao!' in italiano")
        response = await chat_model.ainvoke([test_message])

        return {
            "status": "success",
            "provider": provider,
            "model": model or "default",
            "test_response": response.content[:100],  # First 100 chars
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Provider test failed: {str(e)}"
        )


class ChatMessage(BaseModel):
    message: str
    philosopher_id: str


@app.post("/chat")
async def chat(chat_message: ChatMessage):
    try:
        philosopher_factory = PhilosopherFactory()
        philosopher = philosopher_factory.get_philosopher(chat_message.philosopher_id)

        response, _ = await get_response(
            messages=chat_message.message,
            philosopher_id=chat_message.philosopher_id,
            philosopher_name=philosopher.name,
            philosopher_perspective=philosopher.perspective,
            philosopher_style=philosopher.style,
            philosopher_context="",
        )
        return {"response": response}
    except Exception as e:
        opik_tracer = OpikTracer()
        opik_tracer.flush()

        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()

            if "message" not in data or "philosopher_id" not in data:
                await websocket.send_json(
                    {
                        "error": "Invalid message format. Required fields: 'message' and 'philosopher_id'"
                    }
                )
                continue

            try:
                philosopher_factory = PhilosopherFactory()
                philosopher = philosopher_factory.get_philosopher(
                    data["philosopher_id"]
                )

                # Use streaming response instead of get_response
                response_stream = get_streaming_response(
                    messages=data["message"],
                    philosopher_id=data["philosopher_id"],
                    philosopher_name=philosopher.name,
                    philosopher_perspective=philosopher.perspective,
                    philosopher_style=philosopher.style,
                    philosopher_context="",
                )

                # Send initial message to indicate streaming has started
                await websocket.send_json({"streaming": True})

                # Stream each chunk of the response
                full_response = ""
                async for chunk in response_stream:
                    full_response += chunk
                    await websocket.send_json({"chunk": chunk})

                await websocket.send_json(
                    {"response": full_response, "streaming": False}
                )

            except Exception as e:
                opik_tracer = OpikTracer()
                opik_tracer.flush()

                await websocket.send_json({"error": str(e)})

    except WebSocketDisconnect:
        pass


@app.post("/reset-memory")
async def reset_conversation():
    """Resets the conversation state. It deletes the two collections needed for keeping LangGraph state in MongoDB.

    Raises:
        HTTPException: If there is an error resetting the conversation state.
    Returns:
        dict: A dictionary containing the result of the reset operation.
    """
    try:
        result = await reset_conversation_state()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reset-all-memory")
async def reset_all_memory():
    """Resets ALL memory: both conversation state (short-term) and RAG documents (long-term).
    
    This endpoint deletes:
    - Conversation checkpoints and writes (short-term memory)
    - RAG documents (long-term memory)
    
    Use this when you want to completely reset the system.

    Raises:
        HTTPException: If there is an error resetting memory.
    Returns:
        dict: A dictionary containing the result of the reset operation.
    """
    from pymongo import MongoClient
    from philoagents.config import settings
    
    try:
        # Reset conversation state (short-term memory)
        conversation_result = await reset_conversation_state()
        
        # Reset long-term memory (RAG documents)
        client = MongoClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB_NAME]
        
        collections_deleted = []
        
        # Delete long-term memory collection
        if settings.MONGO_LONG_TERM_MEMORY_COLLECTION in db.list_collection_names():
            db.drop_collection(settings.MONGO_LONG_TERM_MEMORY_COLLECTION)
            collections_deleted.append(settings.MONGO_LONG_TERM_MEMORY_COLLECTION)
        
        client.close()
        
        return {
            "status": "success",
            "message": "All memory reset successfully",
            "details": {
                "conversation_state": conversation_result,
                "long_term_memory_deleted": collections_deleted
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset all memory: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
