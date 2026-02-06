<div align="center">
  <h1>Babilonia: Il Segreto di Bobby</h1>
  <h3>Un gioco investigativo 2D con personaggi AI nella misteriosa citta di Babilonia</h3>
  <p><i>Fork del corso open-source <a href="https://github.com/neural-maze/philoagents-course">PhiloAgents</a> di <a href="https://theneuralmaze.substack.com/">The Neural Maze</a> e <a href="https://decodingml.substack.com">Decoding ML</a></i></p>
</div>

## Il Gioco

Interpreti **Sophia**, una giovane investigatrice. Il Capo-citta Giacomo e stato rapito! Esplora Babilonia, parla con i suoi abitanti, risolvi i loro enigmi e raccogli le 5 lettere che compongono il nome del colpevole.

### Controlli

| Tasto | Azione |
|-------|--------|
| Frecce | Muoviti nella mappa |
| SPAZIO | Parla con i personaggi |
| INVIO | Invia la tua risposta |
| ESC | Chiudi il dialogo |

### I Personaggi

| Personaggio | Luogo | Personalita |
|-------------|-------|-------------|
| **Nicolo** | Punto di Spawn | La guida misteriosa |
| **Akane** | Mercato delle Ombre | Mercante tsundere |
| **Hiroshi** | Giardini Pensili | Giardiniere superbo |
| **Ryo** | Tempio Diroccato | Monaco eremita |
| **Mei** | Biblioteca Infestata | Bibliotecaria dolce |
| **Kaito** | Porto Dimenticato | Vecchio marinaio |

## Quick Start

```bash
# 1. Configura le variabili d'ambiente
cp philoagents-api/.env.example philoagents-api/.env
# Modifica .env con le tue API keys (minimo: GROQ_API_KEY)

# 2. Avvia tutto
make infrastructure-up

# 3. Gioca!
# Apri http://localhost:8080
```

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Frontend | **Phaser 3** (game engine) + Webpack 5 |
| Backend | **FastAPI** + **LangGraph** + LangChain |
| Database | **MongoDB** (stato conversazioni) |
| AI | **Groq** (default), OpenAI, Gemini, Anthropic |
| Comunicazione | **WebSocket** (streaming real-time) |
| Deploy | Docker Compose (locale), Railway (produzione) |

## Come Funziona l'AI

Ogni personaggio e un agente AI con:

1. **Prompt di personalita** - Stile comunicativo, enigma, risposta corretta, lettera da dare
2. **Memoria conversazionale** - Ricorda la conversazione corrente (auto-riassunta dopo 30 messaggi)
3. **Stato di gioco** - Traccia progressi e gestisce la vittoria

Il workflow LangGraph:
```
Input → Genera Risposta → Serve uno strumento?
                            |-- Si: Vittoria (solo Nicolo) → Rivela identita
                            |-- No: Serve riassunto? (>30 messaggi)
                                    |-- Si → Riassumi → Fine
                                    |-- No → Fine
```

## Configurazione LLM

Il gioco supporta 4 provider LLM. Modifica `philoagents-api/.env`:

```bash
LLM_PROVIDER=groq                    # groq | openai | gemini | anthropic
LLM_MODEL=llama-3.3-70b-versatile    # Modello principale
GROQ_API_KEY=your_key                # Chiave API del provider scelto
```

Per verificare: `curl http://localhost:8000/models/current`

## Documentazione

| Documento | Descrizione |
|-----------|-------------|
| [CLAUDE.md](CLAUDE.md) | Guida tecnica completa del progetto |
| [docs/MULTI_PROVIDER_SETUP.md](docs/MULTI_PROVIDER_SETUP.md) | Configurazione multi-provider LLM |
| [docs/RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md) | Deploy su Railway |
| [docs/PROMPT_VERSIONING.md](docs/PROMPT_VERSIONING.md) | Versioning dei prompt con Opik |
| [docs/UPDATING_PROMPTS_AND_NAMES.md](docs/UPDATING_PROMPTS_AND_NAMES.md) | Come aggiornare prompt e nomi |
| [docs/GUIDA_COME_FUNZIONA_IL_GIOCO.md](docs/GUIDA_COME_FUNZIONA_IL_GIOCO.md) | Come funziona il gioco (per studenti) |
| [docs/GUIDA_PERSONAGGI_RAGAZZI.md](docs/GUIDA_PERSONAGGI_RAGAZZI.md) | Guida ai personaggi (per studenti) |
| [docs/GUIDA_TILED_RAGAZZI.md](docs/GUIDA_TILED_RAGAZZI.md) | Guida a Tiled Map Editor (per studenti) |

## Crediti

Fork del corso **PhiloAgents** di [The Neural Maze](https://theneuralmaze.substack.com/) e [Decoding ML](https://decodingml.substack.com), in collaborazione con MongoDB, Opik e Groq.

## Licenza

MIT - vedi [LICENSE](LICENSE) per i dettagli.
