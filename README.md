<div align="center">
  <h1>🏛️ Babilonia: Il Segreto di Bobby 🏛️</h1>
  <h3>Un gioco investigativo con personaggi AI nella misteriosa città di Babilonia</h3>
  <p><i>Basato sul corso open-source <a href="https://github.com/neural-maze/philoagents-course">PhiloAgents</a> di <a href="https://theneuralmaze.substack.com/">The Neural Maze</a> e <a href="https://decodingml.substack.com">Decoding ML</a></i></p>
</div>

<br/>

<p align="center">
    <img src="static/diagrams/system_architecture.png" alt="Architecture" width="600">
</p>

## 🎮 Il Gioco

**Babilonia: Il Segreto di Bobby** è un gioco investigativo 2D dove interpreti **Sophia**, una giovane investigatrice che deve scoprire chi ha rapito il Capo-città Giacomo.

### La Storia

Nell'antica città di Babilonia, il Capo-città Giacomo è stato misteriosamente rapito! Esplora la città, parla con i suoi abitanti e risolvi gli enigmi che nascondono. Solo raccogliendo tutti gli indizi potrai scoprire il nome del colpevole.

### Come si Gioca

| Tasto | Azione |
|-------|--------|
| ↑ ↓ ← → | Muoviti nella mappa |
| SPAZIO | Parla con i personaggi |
| INVIO | Invia la tua risposta |
| ESC | Chiudi il dialogo |

### I Personaggi

Incontrerai 6 personaggi unici, ognuno con la propria personalità e un enigma da risolvere:

| Personaggio | Luogo | Personalità |
|-------------|-------|-------------|
| **Nicolò** | Punto di Spawn | La guida misteriosa |
| **Akane** | Mercato delle Ombre | Mercante tsundere |
| **Hiroshi** | Giardini Pensili | Giardiniere superbo |
| **Ryo** | Tempio Diroccato | Monaco eremita |
| **Mei** | Biblioteca Infestata | Bibliotecaria dolce |
| **Kaito** | Porto Dimenticato | Vecchio marinaio |

Risolvi i loro enigmi per ottenere le lettere che compongono il nome del colpevole!

## 🛠️ Stack Tecnologico

### Frontend (philoagents-ui/)
- **Phaser 3** - Game engine 2D
- **Webpack 5** - Build tool
- **WebSocket** - Comunicazione real-time

### Backend (philoagents-api/)
- **FastAPI** - API framework
- **LangGraph** - Orchestrazione agenti AI
- **LangChain** - Integrazione LLM
- **MongoDB** - Database per memoria e RAG

### AI & LLM
- **Groq** (default) - Inferenza veloce
- **OpenAI** - GPT-4o, embeddings
- **Anthropic** - Claude
- **Google** - Gemini

## 🚀 Quick Start

### Prerequisiti
- Docker e Docker Compose
- Chiavi API (Groq, OpenAI, o altro provider LLM)

### Installazione

1. **Clona il repository**
```bash
git clone https://github.com/neural-maze/philoagents-course.git
cd philoagents-course
```

2. **Configura le variabili d'ambiente**
```bash
cp philoagents-api/.env.example philoagents-api/.env
# Modifica .env con le tue API keys
```

3. **Avvia il gioco**
```bash
docker compose up --build
```

4. **Gioca!**
Apri http://localhost:8080 nel browser

## 📁 Struttura del Progetto

```
.
├── philoagents-api/          # Backend Python
│   ├── src/philoagents/
│   │   ├── domain/           # Modelli e prompt
│   │   ├── application/      # Logica di business
│   │   │   ├── conversation_service/  # LangGraph workflow
│   │   │   └── rag/          # Retrieval-Augmented Generation
│   │   └── infrastructure/   # API e database
│   └── .env                  # Configurazione
│
├── philoagents-ui/           # Frontend JavaScript
│   ├── src/
│   │   ├── scenes/           # Scene Phaser (Game, Menu, etc.)
│   │   ├── classes/          # Character, Dialogue, etc.
│   │   └── services/         # API e WebSocket
│   └── public/assets/        # Sprite, tileset, mappe
│
└── docker-compose.yml        # Orchestrazione servizi
```

## 🧠 Come Funziona l'AI

### Sistema di Memoria Tripla

1. **Memoria Culturale** (Long-term)
   - Conoscenza dai documenti caricati
   - Archiviata in MongoDB con embeddings OpenAI
   - Recuperata tramite RAG quando rilevante

2. **Memoria Conversazionale** (Short-term)
   - Storico della conversazione corrente
   - Auto-riassunta dopo 30 messaggi
   - Mantiene coerenza nel dialogo

3. **Stato del Gioco** (Session)
   - Traccia progressi e interazioni
   - Gestisce meccaniche di gioco

### Workflow LangGraph

```
INPUT → [Genera Risposta] → [Serve RAG?]
                              ├─ Sì → [Recupera Contesto] → [Riassumi] → Torna
                              └─ No → [Riassunto necessario?]
                                        ├─ Sì → [Riassumi Conversazione]
                                        └─ No → OUTPUT
```

## ⚙️ Configurazione

### Variabili d'Ambiente Principali

```env
# LLM Provider (groq, openai, google, anthropic)
LLM_PROVIDER=groq
GROQ_API_KEY=your_key

# Embeddings
OPENAI_API_KEY=your_key

# MongoDB (automatico con Docker)
MONGODB_URI=mongodb://mongodb:27017

# Opik (opzionale - per LLMOps)
OPIK_API_KEY=your_key
```

## 🎓 Crediti

Questo progetto è basato sul corso open-source **PhiloAgents** creato da:
- [The Neural Maze](https://theneuralmaze.substack.com/) - Miguel Otero Pedrido
- [Decoding ML](https://decodingml.substack.com) - Paul Iusztin

In collaborazione con [MongoDB](https://rebrand.ly/philoagents-mongodb), [Opik](https://rebrand.ly/philoagents-opik) e [Groq](https://rebrand.ly/philoagents-groq).

### Corso Originale

Il corso PhiloAgents insegna come costruire un motore di simulazione AI per impersonare filosofi storici. Se vuoi imparare a costruire sistemi simili da zero, consulta:
- **Video**: [The Neural Maze YouTube](https://www.youtube.com/@TheNeuralMaze)
- **Articoli**: [Decoding ML Substack](https://decodingml.substack.com)
- **Codice**: [GitHub Repository](https://github.com/neural-maze/philoagents-course)

## 📚 Documentazione Aggiuntiva

- [INSTALL_AND_USAGE.md](INSTALL_AND_USAGE.md) - Istruzioni dettagliate
- [CONTRIBUTING.md](CONTRIBUTING.md) - Come contribuire

## 🐛 Problemi e Supporto

Hai problemi o domande? Apri una [GitHub Issue](https://github.com/neural-maze/philoagents-course/issues).

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT - vedi [LICENSE](LICENSE) per i dettagli.

---

<div align="center">
  <h3>Sponsor</h3>
  <table style="border-collapse: collapse; border: none;">
    <tr style="border: none;">
      <td align="center" style="border: none; padding: 20px;">
        <a href="https://rebrand.ly/philoagents-mongodb" target="_blank">
          <img src="static/sponsors/mongo.png" width="150" alt="MongoDB">
        </a>
      </td>
      <td align="center" style="border: none; padding: 20px;">
        <a href="https://rebrand.ly/philoagents-opik" target="_blank">
          <img src="static/sponsors/opik.png" width="150" alt="Opik">
        </a>
      </td>
      <td align="center" style="border: none; padding: 20px;">
        <a href="https://rebrand.ly/philoagents-groq" target="_blank">
          <img src="static/sponsors/groq.png" width="150" alt="Groq">
        </a>
      </td>
    </tr>
  </table>
</div>
