# CLAUDE.md - Babilonia: Il Segreto di Bobby

## Project Overview

**Babilonia: Il Segreto di Bobby** is an investigative 2D game where you play as **Sophia**, a young investigator who must discover who kidnapped the city leader Giacomo. Explore the ancient city of Babilonia, talk to its inhabitants, solve their riddles, and collect letters that spell the kidnapper's name.

This is a fork of the open-source [PhiloAgents](https://github.com/neural-maze/philoagents-course) course by The Neural Maze and Decoding ML. The original course taught AI agent simulation with historical philosophers - this fork transforms it into a narrative mystery game with original characters, Italian language, and game mechanics (riddles, victory condition, tutorial).

## Tech Stack

### Backend (`philoagents-api/`)
- **Python 3.11** with **uv** package manager
- **FastAPI** - REST + WebSocket API
- **LangGraph** - AI conversation workflow orchestration
- **LangChain** - LLM abstraction layer (multi-provider)
- **MongoDB** - Conversation state persistence (LangGraph checkpoints)
- **Opik** - LLMOps monitoring (optional)

### Frontend (`philoagents-ui/`)
- **Phaser 3** - 2D game engine
- **Webpack 5** - Build tool
- **WebSocket** - Real-time streaming communication with backend

### LLM Providers (configurable via `.env`)
- **Groq** (default) - Llama models, fast inference, free tier
- **OpenAI** - GPT-4o
- **Google Gemini** - Gemini models
- **Anthropic** - Claude models

### Infrastructure
- **Docker Compose** - MongoDB + API + UI orchestration
- **Nginx** - Frontend static file serving in production

## Quick Start

```bash
# 1. Configure environment
cp philoagents-api/.env.example philoagents-api/.env
# Edit .env with your API keys (at minimum GROQ_API_KEY)

# 2. Start everything
make infrastructure-up

# 3. Play at http://localhost:8080
```

Ports: MongoDB `27017`, API `8000`, UI `8080`

## Project Structure

```
.
├── philoagents-api/                 # Python backend
│   ├── src/philoagents/
│   │   ├── config.py                # Settings (env vars, defaults)
│   │   ├── domain/
│   │   │   ├── philosopher_factory.py  # Character definitions (names, styles, riddles)
│   │   │   ├── philosopher.py       # Philosopher data model
│   │   │   ├── prompts.py           # System prompts with Opik versioning
│   │   │   └── exceptions.py        # Custom exceptions
│   │   ├── application/
│   │   │   ├── conversation_service/
│   │   │   │   ├── generate_response.py  # Main entry: get_response / get_streaming_response
│   │   │   │   ├── reset_conversation.py
│   │   │   │   └── workflow/
│   │   │   │       ├── graph.py     # LangGraph workflow definition
│   │   │   │       ├── nodes.py     # Workflow nodes (conversation, summarize, victory)
│   │   │   │       ├── chains.py    # LLM chain construction
│   │   │   │       ├── edges.py     # Conditional routing (summarize trigger)
│   │   │   │       ├── tools.py     # LangChain tools (RAG retriever, victory trigger)
│   │   │   │       └── state.py     # PhilosopherState definition
│   │   │   └── llm_service/
│   │   │       └── model_factory.py # Multi-provider LLM factory
│   │   └── infrastructure/
│   │       ├── api.py               # FastAPI endpoints + WebSocket
│   │       ├── opik_utils.py        # Opik/Comet ML configuration
│   │       └── mongo/
│   │           └── client.py        # MongoDB wrapper
│   ├── .env.example                 # Environment template
│   ├── Dockerfile                   # Production container
│   └── pyproject.toml               # Dependencies
│
├── philoagents-ui/                  # JavaScript frontend
│   ├── src/
│   │   ├── main.js                  # Phaser game config (1024x768)
│   │   ├── scenes/
│   │   │   ├── Preloader.js         # Asset loading
│   │   │   ├── MainMenu.js          # Start menu (Gioca, Istruzioni, Crediti)
│   │   │   ├── Game.js              # Main gameplay, tutorial, victory screen
│   │   │   └── PauseMenu.js         # Pause overlay
│   │   ├── classes/
│   │   │   ├── Character.js         # NPC behavior (roaming, animations, interaction)
│   │   │   ├── DialogueManager.js   # Dialogue flow, keyboard input, streaming
│   │   │   └── DialogueBox.js       # Dialogue UI component
│   │   └── services/
│   │       ├── WebSocketApiService.js  # Primary: streaming WS communication
│   │       └── ApiService.js        # Fallback: HTTP API + memory reset
│   ├── public/assets/
│   │   ├── characters/              # Sprite atlases (atlas.png + atlas.json)
│   │   ├── tilemaps/                # Tiled map JSON
│   │   └── tilesets/                # Tileset images
│   ├── webpack/                     # Build configs (dev + prod)
│   ├── Dockerfile                   # Nginx-based production container
│   └── package.json                 # Phaser 3.88.2
│
├── docker-compose.yml               # MongoDB + API + UI
├── Makefile                         # infrastructure-up/stop/build, call-agent
└── docs/                            # Documentation (Italian guides for students)
```

## Game Characters

| ID | Name | Location | Riddle Answer | Letter | Personality |
|----|------|----------|--------------|--------|-------------|
| `nicolo` | Nicolo | Spawn / Portal | - | - | Friendly guide (secretly Bobby the kidnapper) |
| `akane` | Akane | Mercato delle Ombre | Bara (coffin) | **B** | Tsundere merchant |
| `hiroshi` | Hiroshi | Giardini Pensili | Chiodo (nail) | **O** | Arrogant gardener |
| `ryo` | Ryo | Tempio Diroccato | Riccio (hedgehog) | **B** | Hermit monk, speaks in monosyllables |
| `mei` | Mei | Biblioteca Infestata | Lettera (letter) | **B** | Sweet librarian, Kaito's granddaughter |
| `kaito` | Kaito | Porto Dimenticato | Ancora (anchor) | **Y** | Old sailor, Mei's grandfather |
| `socrates` | Gio Marco Baglioni | Hidden easter egg | - | - | Game creator, breaks 4th wall |

Letters spell **BOBBY** - the true identity of Nicolo, the kidnapper.

## LangGraph Workflow

```
START → conversation_node → route_tools
                              ├─ retrieve_philosopher_context → summarize_context → conversation_node (loop)
                              ├─ victory_node → conversation_node (Nicolo reveals identity)
                              └─ connector_node → should_summarize?
                                                    ├─ Yes (>30 msgs) → summarize_conversation → END
                                                    └─ No → END
```

Key behaviors:
- **Conversation node**: Main LLM call with character prompt, style, perspective
- **Victory trigger**: Only Nicolo has the `trigger_victory` tool. When player says "BOBBY", Nicolo calls it
- **Summarization**: After 30 messages, conversation is auto-summarized to save tokens
- **RAG retriever**: Still in code but NOT USED (philosopher_context always passed as "")

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ws/chat` | WebSocket | Primary: streaming chat with game events |
| `/chat` | POST | Non-streaming chat fallback |
| `/reset-memory` | POST | Clear conversation state |
| `/reset-all-memory` | POST | Clear all state + RAG documents |
| `/models/current` | GET | Current LLM provider config |
| `/models/available` | GET | All providers and their setup status |
| `/models/test` | POST | Test a provider connection |
| `/debug/prompt-config` | GET | Check prompt version/content |

## Environment Variables

```bash
# Required
LLM_PROVIDER=groq                    # groq | openai | gemini | anthropic
LLM_MODEL=llama-3.3-70b-versatile    # Main conversation model
LLM_MODEL_SUMMARY=llama-3.1-8b-instant
GROQ_API_KEY=your_key                # Required for default provider

# Optional (for other providers)
OPENAI_API_KEY=                      # Also needed for RAG embeddings if enabled
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Optional (LLMOps)
COMET_API_KEY=                       # Opik monitoring
PROMPT_VERSION=v1                    # Prompt versioning (change to hot-reload)
```

## Common Tasks

### Changing character names/prompts
1. Edit `philoagents-api/src/philoagents/domain/philosopher_factory.py` (3 dicts: NAMES, STYLES, PERSPECTIVES)
2. Edit `philoagents-ui/src/scenes/Game.js` (philosopherConfigs array)
3. Optionally bump `PROMPT_VERSION` in `.env`
4. Restart: `docker-compose up -d --force-recreate api`

### Switching LLM provider
1. Edit `.env`: change `LLM_PROVIDER`, `LLM_MODEL`, and add the API key
2. Restart: `docker-compose restart philoagents-api`
3. Verify: `curl http://localhost:8000/models/current`

### Testing a provider
```bash
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "groq"}'
```

### Calling agent directly (bypass UI)
```bash
make call-agent
```

### Editing the tilemap
Open `philoagents-ui/public/assets/tilemaps/philoagents-town2.json` in [Tiled Map Editor](https://www.mapeditor.org/). Save as JSON.

## Architecture Notes

- All game text is in **Italian** (enforced by system prompt)
- Character responses are capped at **150 characters** (game UI constraint)
- WebSocket is primary communication channel (with HTTP fallback)
- Each character conversation has a persistent thread in MongoDB
- Frontend auto-detects API URL for local dev, Codespaces, and Railway deployment
- Game has a tutorial overlay (2 pages) shown on first load
- Victory screen triggers when backend sends `game_event: "victory"`

## Known Technical Debt

- RAG system code is still present but unused (see dead code section below)
- "Philosopher" naming persists in code (should be "character")
- `philosopher_context` parameter flows through entire pipeline but is always ""
- Evaluation/dataset generation code from original course is unused
- 14 unused character sprite directories from original game
- Several pip dependencies only needed for RAG (langchain-mongodb, wikipedia, datasketch)
