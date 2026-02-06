# Babilonia API

Backend Python per il gioco Babilonia: Il Segreto di Bobby.

Vedi [CLAUDE.md](../CLAUDE.md) per la documentazione tecnica completa.

## Quick Start

```bash
# Con Docker (consigliato)
cd ..
make infrastructure-up

# Senza Docker
uv venv .venv && source .venv/bin/activate
uv pip install -e .
cp .env.example .env  # Configura le API keys
uv run fastapi run src/philoagents/infrastructure/api.py --port 8000
```

## Comandi Utili

```bash
make format-check    # Controlla formattazione
make format-fix      # Correggi formattazione
make lint-check      # Controlla linting
make lint-fix        # Correggi linting
make test            # Esegui test
```

## API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/ws/chat` | WebSocket | Chat streaming (primario) |
| `/chat` | POST | Chat non-streaming (fallback) |
| `/models/current` | GET | Provider LLM corrente |
| `/models/test` | POST | Testa un provider |
| `/reset-memory` | POST | Reset memoria conversazioni |
| `/debug/prompt-config` | GET | Verifica versione prompt |
