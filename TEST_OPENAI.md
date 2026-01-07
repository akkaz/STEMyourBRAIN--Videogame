# Testing OpenAI Integration

## Prerequisites
Make sure your `.env` file has:
```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
LLM_MODEL_SUMMARY=gpt-4o-mini
LLM_MODEL_CONTEXT_SUMMARY=gpt-4o-mini
OPENAI_API_KEY=sk-your-key-here
```

## Option 1: Test via API Server (Recommended)

### Start the server:

**If using Docker:**
```bash
cd /home/akkaz/dev/philoagents-course
docker-compose restart philoagents-api
docker-compose logs -f philoagents-api
```

**If running locally:**
```bash
cd /home/akkaz/dev/philoagents-course/philoagents-api
uv run uvicorn philoagents.infrastructure.api:app --reload --host 0.0.0.0 --port 8000
```

### Test endpoints:

**1. Check current configuration:**
```bash
curl http://localhost:8000/models/current
```

Expected response:
```json
{
  "provider": "openai",
  "models": {
    "main": "gpt-4o-mini",
    "summary": "gpt-4o-mini",
    "context_summary": "gpt-4o-mini"
  }
}
```

**2. Test OpenAI connection:**
```bash
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "model": "gpt-4o-mini"}'
```

Expected response:
```json
{
  "status": "success",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "test_response": "Ciao!"
}
```

**3. Chat with a philosopher using OpenAI:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ciao Socrate! Come stai?",
    "philosopher_id": "socrates"
  }'
```

Expected response:
```json
{
  "response": "Ciao! Sto bene, grazie per avermelo chiesto..."
}
```

**4. Test WebSocket streaming:**
```bash
# Install websocat if needed: cargo install websocat
# Or use: sudo apt install websocat

websocat ws://localhost:8000/ws/chat
# Then send:
{"message": "Ciao!", "philosopher_id": "plato"}
```

## Option 2: Simple Python Test (Without RAG)

Create a test file:
```bash
cd /home/akkaz/dev/philoagents-course/philoagents-api
cat > test_openai.py << 'EOF'
#!/usr/bin/env python3
"""Quick test of OpenAI integration without dependencies."""

import os
from dotenv import load_dotenv

load_dotenv()

# Test 1: Check environment
print("=== Environment Check ===")
provider = os.getenv('LLM_PROVIDER', 'not set')
model = os.getenv('LLM_MODEL', 'not set')
api_key = os.getenv('OPENAI_API_KEY', 'not set')

print(f"Provider: {provider}")
print(f"Model: {model}")
print(f"API Key: {'✅ Set' if api_key != 'not set' and len(api_key) > 10 else '❌ Not set'}")
print()

if provider != 'openai':
    print("⚠️  LLM_PROVIDER is not set to 'openai'")
    print("Please update your .env file and restart")
    exit(1)

if api_key == 'not set' or len(api_key) < 10:
    print("❌ OPENAI_API_KEY is not set")
    print("Please add your OpenAI API key to .env file")
    exit(1)

# Test 2: Import and create model
print("=== Testing Model Creation ===")
try:
    from philoagents.application.llm_service import get_chat_model
    model_instance = get_chat_model()
    print(f"✅ Model created: {type(model_instance).__name__}")
except Exception as e:
    print(f"❌ Failed to create model: {e}")
    exit(1)

# Test 3: Simple API call
print("\n=== Testing OpenAI API Call ===")
try:
    from langchain_core.messages import HumanMessage

    response = model_instance.invoke([
        HumanMessage(content="Say 'Hello from OpenAI!' in Italian")
    ])

    print(f"✅ Response received: {response.content}")
    print("\n🎉 OpenAI integration is working!")

except Exception as e:
    print(f"❌ API call failed: {e}")
    exit(1)
EOF

chmod +x test_openai.py
```

Run the test:
```bash
uv run python test_openai.py
```

## Option 3: Using Docker Compose

**1. Update .env and rebuild:**
```bash
cd /home/akkaz/dev/philoagents-course
docker-compose down
docker-compose up -d
```

**2. Check logs:**
```bash
docker-compose logs -f philoagents-api
```

**3. Test via curl (same as Option 1 above)**

## Troubleshooting

### Issue: "OPENAI_API_KEY is not set"

**Solution:**
1. Check your `.env` file exists: `ls -la /home/akkaz/dev/philoagents-course/philoagents-api/.env`
2. Verify the key is set: `grep OPENAI_API_KEY .env`
3. Restart the server/container

### Issue: "Invalid API key"

**Solution:**
1. Verify your OpenAI API key at: https://platform.openai.com/api-keys
2. Make sure it starts with `sk-`
3. Check you have credits/billing enabled

### Issue: Server won't start

**Solution:**
1. Check logs: `docker-compose logs philoagents-api`
2. Or if local: check terminal output
3. Common issue: MongoDB not running
   ```bash
   docker-compose up -d local_dev_atlas
   ```

### Issue: Using Docker but .env not loaded

**Solution:**
1. Docker Compose needs .env in project root: `/home/akkaz/dev/philoagents-course/.env`
2. Copy from philoagents-api if needed:
   ```bash
   cp philoagents-api/.env .env
   ```
3. Restart containers:
   ```bash
   docker-compose restart
   ```

## Quick Verification Commands

```bash
# Check if server is running
curl http://localhost:8000/models/current

# Check available providers
curl http://localhost:8000/models/available

# Test OpenAI specifically
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'

# Full conversation test
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ciao!", "philosopher_id": "socrates"}'
```

## Expected Behavior

When working correctly, you should see:
1. ✅ Model factory creates `ChatOpenAI` instance
2. ✅ Test endpoint returns successful response
3. ✅ Chat endpoint returns philosopher responses generated by OpenAI
4. ✅ Responses are in Italian (as configured in prompts)
5. ✅ WebSocket streaming works with chunked responses

## Performance Comparison

You can compare providers by timing responses:

```bash
# Test Groq
time curl -X POST http://localhost:8000/models/test -H "Content-Type: application/json" -d '{"provider": "groq"}'

# Test OpenAI
time curl -X POST http://localhost:8000/models/test -H "Content-Type: application/json" -d '{"provider": "openai"}'
```

Groq is typically faster, but OpenAI (GPT-4) may give higher quality responses.
