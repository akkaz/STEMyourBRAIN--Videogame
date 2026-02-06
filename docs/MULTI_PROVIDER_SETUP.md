# Multi-Provider LLM Setup Guide

This guide explains how to use the new multi-provider LLM system in PhiloAgents.

## Overview

The PhiloAgents API now supports multiple LLM providers through a unified LangChain-based abstraction layer:

- **Groq** - Fast inference with Llama models (free tier available)
- **Google Gemini** - Google's Gemini models
- **OpenAI** - GPT-4 and other OpenAI models
- **Anthropic** - Claude models

## Quick Start

### 1. Install Dependencies

```bash
cd philoagents-api
uv sync
```

### 2. Configure Your Provider

Edit your `.env` file:

```bash
# Select your provider
LLM_PROVIDER=gemini  # Options: groq, gemini, openai, anthropic

# Configure models for your chosen provider
LLM_MODEL=gemini-2.0-flash-exp
LLM_MODEL_SUMMARY=gemini-1.5-flash
LLM_MODEL_CONTEXT_SUMMARY=gemini-1.5-flash

# Add your API key
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart the Server

```bash
docker-compose restart philoagents-api
# OR if running locally:
uv run uvicorn philoagents.infrastructure.api:app --reload
```

## Configuration Examples

### For Gemini (Recommended for Free Tier)

```bash
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.0-flash-exp
LLM_MODEL_SUMMARY=gemini-1.5-flash
LLM_MODEL_CONTEXT_SUMMARY=gemini-1.5-flash
GEMINI_API_KEY=your_gemini_api_key
```

Get your Gemini API key: https://aistudio.google.com/apikey

### For OpenAI

```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_MODEL_SUMMARY=gpt-4o-mini
LLM_MODEL_CONTEXT_SUMMARY=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key
```

### For Anthropic Claude

```bash
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_MODEL_SUMMARY=claude-3-5-haiku-20241022
LLM_MODEL_CONTEXT_SUMMARY=claude-3-5-haiku-20241022
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Get your Anthropic API key: https://console.anthropic.com/

### For Groq (Default)

```bash
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
LLM_MODEL_SUMMARY=llama-3.1-8b-instant
LLM_MODEL_CONTEXT_SUMMARY=llama-3.1-8b-instant
GROQ_API_KEY=your_groq_api_key
```

## API Endpoints

### Check Current Configuration

```bash
curl http://localhost:8000/models/current
```

Response:
```json
{
  "provider": "gemini",
  "models": {
    "main": "gemini-2.0-flash-exp",
    "summary": "gemini-1.5-flash",
    "context_summary": "gemini-1.5-flash"
  }
}
```

### List Available Providers

```bash
curl http://localhost:8000/models/available
```

Response:
```json
{
  "current": "gemini",
  "providers": {
    "groq": {
      "configured": true,
      "default_models": {
        "main": "llama-3.3-70b-versatile",
        "summary": "llama-3.1-8b-instant"
      },
      "description": "Fast inference with Llama models (free tier available)"
    },
    "gemini": {
      "configured": true,
      "default_models": {
        "main": "gemini-2.0-flash-exp",
        "summary": "gemini-1.5-flash"
      },
      "description": "Google's Gemini models"
    }
    // ... other providers
  }
}
```

### Test a Provider

```bash
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "gemini", "model": "gemini-2.0-flash-exp"}'
```

Response:
```json
{
  "status": "success",
  "provider": "gemini",
  "model": "gemini-2.0-flash-exp",
  "test_response": "Ciao!"
}
```

## Model Selection Strategy

The system uses three different models for efficiency:

1. **LLM_MODEL** - Main conversation model (most capable)
2. **LLM_MODEL_SUMMARY** - Conversation summarization (faster/cheaper)
3. **LLM_MODEL_CONTEXT_SUMMARY** - RAG context summarization (faster/cheaper)

### Recommended Settings by Use Case

**Development/Testing (Free):**
```bash
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash  # Free tier
LLM_MODEL_SUMMARY=gemini-1.5-flash
LLM_MODEL_CONTEXT_SUMMARY=gemini-1.5-flash
```

**Production (Best Quality):**
```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o  # Most capable
LLM_MODEL_SUMMARY=gpt-4o-mini  # Cost-effective for summaries
LLM_MODEL_CONTEXT_SUMMARY=gpt-4o-mini
```

**Production (Best Speed):**
```bash
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile  # Very fast
LLM_MODEL_SUMMARY=llama-3.1-8b-instant  # Ultra fast
LLM_MODEL_CONTEXT_SUMMARY=llama-3.1-8b-instant
```

## Architecture

The multi-provider system is built on:

- **LangChain** - Unified interface for all providers
- **Factory Pattern** - `model_factory.py` creates appropriate models
- **Backward Compatible** - Existing LangGraph workflows work unchanged

### Key Files

- `src/philoagents/config.py` - Configuration settings
- `src/philoagents/application/llm_service/model_factory.py` - Provider factory
- `src/philoagents/application/conversation_service/workflow/chains.py` - LLM chains
- `src/philoagents/infrastructure/api.py` - API endpoints

## Troubleshooting

### API Key Not Set

Error: `GEMINI_API_KEY is not set in environment`

Solution: Add the API key to your `.env` file and restart the server.

### Provider Not Working

Use the test endpoint to diagnose:
```bash
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "gemini"}'
```

### Switching Providers

1. Update `.env` file with new `LLM_PROVIDER` and API key
2. Restart the Docker container: `docker-compose restart philoagents-api`
3. Verify: `curl http://localhost:8000/models/current`

## Advanced Usage

### Using Different Providers for Different Models

You can mix providers by setting specific API keys and changing configuration:

```bash
# Main conversation with Gemini
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.0-flash-exp
GEMINI_API_KEY=your_key

# Later switch to OpenAI for evaluation
# Just change LLM_PROVIDER in .env and restart
```

### Programmatic Model Selection

In your code, you can override the provider:

```python
from philoagents.application.llm_service import get_chat_model

# Use default provider from config
model = get_chat_model()

# Override provider
gemini_model = get_chat_model(provider="gemini")
openai_model = get_chat_model(provider="openai", model_name="gpt-4o")
```

## Migration from Old System

The old Groq-only configuration is still supported. The system will default to Groq if `LLM_PROVIDER` is not set.

Old `.env`:
```bash
GROQ_API_KEY=xxx
GROQ_LLM_MODEL=llama-3.3-70b-versatile
```

This still works! The system automatically uses Groq as the default provider.

## Support

For issues or questions:
- Check logs: `docker-compose logs philoagents-api`
- Test endpoints: `/models/current`, `/models/available`, `/models/test`
- Review configuration: Check `.env` file settings
