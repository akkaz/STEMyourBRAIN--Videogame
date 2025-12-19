# Guida Completa: Aggiornare Prompt e Nomi dei Filosofi

Questa guida ti spiega come modificare i prompt e i nomi dei filosofi nel progetto PhiloAgents senza dover ricostruire i container Docker.

## Indice
1. [Come Funziona il Sistema di Versioning](#come-funziona-il-sistema-di-versioning)
2. [Aggiornare i Prompt](#aggiornare-i-prompt)
3. [Aggiornare Nomi e Configurazioni](#aggiornare-nomi-e-configurazioni)
4. [Workflow Completo con Esempio](#workflow-completo-con-esempio)
5. [Verifica delle Modifiche](#verifica-delle-modifiche)
6. [Troubleshooting](#troubleshooting)

---

## Come Funziona il Sistema di Versioning

Il sistema usa la variabile d'ambiente `PROMPT_VERSION` per creare versioni uniche dei prompt in Opik:

```
PROMPT_VERSION=v1 → philosopher_character_card_v1
PROMPT_VERSION=v2 → philosopher_character_card_v2
PROMPT_VERSION=v3 → philosopher_character_card_v3
```

Quando cambi la versione e riavvii, Opik crea automaticamente una nuova versione del prompt nella sua libreria.

---

## Aggiornare i Prompt

### File da Modificare
📁 [`philoagents-api/src/philoagents/domain/prompts.py`](src/philoagents/domain/prompts.py)

### Prompt Disponibili

1. **PHILOSOPHER_CHARACTER_CARD** - Il prompt principale per il carattere del filosofo
2. **SUMMARY_PROMPT** - Prompt per creare riassunti della conversazione
3. **EXTEND_SUMMARY_PROMPT** - Prompt per estendere riassunti esistenti
4. **CONTEXT_SUMMARY_PROMPT** - Prompt per riassumere il contesto
5. **EVALUATION_DATASET_GENERATION_PROMPT** - Prompt per generare dataset di valutazione

### Esempio: Modificare il Prompt del Filosofo

```python
# In prompts.py, modifica il contenuto di __PHILOSOPHER_CHARACTER_CARD:

__PHILOSOPHER_CHARACTER_CARD = """
🇮🇹 LINGUA OBBLIGATORIA: ITALIANO
ATTENZIONE: Devi rispondere ESCLUSIVAMENTE in ITALIANO.

---

⚠️ IDENTITÀ CRUCIALE ⚠️
IL TUO NOME È: {{philosopher_name}}
SEI ESATTAMENTE {{philosopher_name}} come descritto qui sotto.

---

# QUI MODIFICA IL TUO PROMPT
Facciamo un gioco di ruolo. Sei {{philosopher_name}}...
[resto del prompt]
"""
```

---

## Aggiornare Nomi e Configurazioni

### File da Modificare
📁 [`philoagents-api/src/philoagents/domain/philosopher_factory.py`](src/philoagents/domain/philosopher_factory.py)

Questo file contiene tre dizionari principali:

### 1. PHILOSOPHER_NAMES
Mappa l'ID del filosofo al suo nome visualizzato:

```python
PHILOSOPHER_NAMES = {
    "socrates": "Gio Marco Baglioni",  # ← Cambia qui il nome
    "plato": "Platone",
    "aristotle": "Aristotele",
    # ...
}
```

### 2. PHILOSOPHER_STYLES
Definisce lo stile comunicativo del filosofo:

```python
PHILOSOPHER_STYLES = {
    "socrates": "Gio Marco Baglioni è uno sviluppatore software...",
    # ← Assicurati che il nome qui corrisponda a quello in NAMES
}
```

### 3. PHILOSOPHER_PERSPECTIVES
Definisce la prospettiva filosofica:

```python
PHILOSOPHER_PERSPECTIVES = {
    "socrates": """Gio Marco Baglioni è uno sviluppatore software...
    Ti sfida a pensare in termini di...""",
    # ← Mantieni la coerenza del nome
}
```

### File UI da Modificare
📁 [`philoagents-ui/src/scenes/Game.js`](../../philoagents-ui/src/scenes/Game.js)

```javascript
const philosopherConfigs = [
    { 
        id: "socrates", 
        name: "Gio Marco Baglioni",  // ← Cambia anche qui!
        spawnName: "Socrates", 
        defaultDirection: "right", 
        roamRadius: 800 
    },
    // ...
];
```

---

## Workflow Completo con Esempio

### Scenario: Cambiare "Gio Marco" in "Gio Marco Baglioni"

#### Step 1: Modifica i File

**1.1 - Modifica il prompt (opzionale se non cambi contenuto)**
```bash
# Se modifichi solo il nome, il prompt potrebbe non necessitare modifiche
# Ma se vuoi aggiornare qualcosa, modifica:
nano philoagents-api/src/philoagents/domain/prompts.py
```

**1.2 - Modifica le configurazioni del filosofo**
```bash
nano philoagents-api/src/philoagents/domain/philosopher_factory.py
```

Cambia in tre punti:
```python
# 1. Nel dizionario NAMES
"socrates": "Gio Marco Baglioni",

# 2. Nel dizionario STYLES
"socrates": "Gio Marco Baglioni è uno sviluppatore...",

# 3. Nel dizionario PERSPECTIVES
"socrates": """Gio Marco Baglioni è uno sviluppatore...""",
```

**1.3 - Modifica l'UI**
```bash
nano philoagents-ui/src/scenes/Game.js
```

```javascript
{ id: "socrates", name: "Gio Marco Baglioni", ... }
```

#### Step 2: Incrementa la Versione del Prompt

```bash
nano philoagents-api/.env
```

Cambia:
```bash
PROMPT_VERSION=v3  # da v2 a v3, o da v3 a v4, ecc.
```

#### Step 3: Riavvia i Container

**⚠️ IMPORTANTE**: `docker-compose restart` NON rilegge il file `.env`!

**Opzione A - Ricreare solo l'API (più veloce):**
```bash
docker-compose up -d --force-recreate api
```

**Opzione B - Riavvio completo:**
```bash
docker-compose down && docker-compose up -d
```

**Opzione C - Stop/Remove/Up:**
```bash
docker-compose stop api
docker-compose rm -f api
docker-compose up -d api
```

#### Step 4: Verifica le Modifiche

```bash
# Attendi che l'API si avvii (10-15 secondi)
sleep 15

# Verifica la versione caricata
curl http://localhost:8000/debug/prompt-config | python3 -m json.tool
```

Dovresti vedere:
```json
{
    "prompt_version_env": "v3",
    "prompts": {
        "philosopher_character_card": {
            "name": "philosopher_character_card_v3",
            "content_preview": "...",
            "content_length": 1923
        }
    }
}
```

---

## Verifica delle Modifiche

### 1. Verifica Tecnica (Backend)

```bash
# Controlla la versione del prompt
curl http://localhost:8000/debug/prompt-config

# Controlla i log dell'API
docker-compose logs api | grep -i prompt

# Controlla i log di Opik
docker-compose logs api | grep -i opik
```

### 2. Verifica Visiva (Frontend)

1. **Apri il gioco**: http://localhost:8080
2. **Trova il personaggio** con il nuovo nome
3. **Interagisci** e verifica che si presenti correttamente
4. **Controlla il nome** nella dialog box

### 3. Verifica in Opik

1. Apri la dashboard di Opik (https://www.comet.com/opik)
2. Vai alla sezione **Prompt Library**
3. Cerca `philosopher_character_card_v3` (o la tua versione)
4. Verifica che il contenuto sia quello aggiornato
5. Nelle **Traces** delle conversazioni, verifica quale versione viene usata

---

## Troubleshooting

### Problema: Il prompt non si aggiorna in Opik

**Causa**: Opik sta usando una versione cached dalla sua libreria.

**Soluzione**:
1. Incrementa `PROMPT_VERSION` a una nuova versione (es: v4)
2. Riavvia con `docker-compose up -d --force-recreate api`
3. Verifica con `curl http://localhost:8000/debug/prompt-config`

---

### Problema: Vedo ancora v2 dopo aver cambiato a v3

**Causa**: Il container non ha ricaricato il file `.env`.

**Soluzione**:
```bash
# NON fare: docker-compose restart api ❌

# Fai invece:
docker-compose up -d --force-recreate api ✅
```

---

### Problema: Il nome non cambia nell'UI

**Causa**: L'UI non si è aggiornata o il file `Game.js` non è stato modificato.

**Soluzione**:
1. Verifica di aver modificato `philoagents-ui/src/scenes/Game.js`
2. Riavvia l'UI: `docker-compose restart ui`
3. Forza il refresh del browser: `Ctrl+Shift+R` o `Cmd+Shift+R`
4. Controlla la console del browser per errori

---

### Problema: Il filosofo non si presenta con il nome giusto

**Causa**: Il nome non è stato aggiornato in tutti i dizionari.

**Soluzione**:
Verifica che il nome sia coerente in:
- ✅ `PHILOSOPHER_NAMES["socrates"]`
- ✅ `PHILOSOPHER_STYLES["socrates"]` (nel testo della descrizione)
- ✅ `PHILOSOPHER_PERSPECTIVES["socrates"]` (nel testo della descrizione)
- ✅ `Game.js` configurazione del personaggio

---

### Problema: Errore "Network needs to be recreated"

**Causa**: Docker Compose ha rilevato un cambio di configurazione di rete.

**Soluzione**:
```bash
docker-compose down
docker-compose up -d
```

---

## Best Practices

### 1. **Documenta i Cambiamenti**
Tieni un changelog delle versioni dei prompt:
```
v1 - Prompt iniziale in inglese
v2 - Tradotto in italiano, aggiunto controllo lingua
v3 - Cambiato nome da "Gio Marco" a "Gio Marco Baglioni"
v4 - Modificato stile comunicativo più tecnico
```

### 2. **Testa Prima in Dev**
- Fai sempre un test locale prima di deployare
- Verifica in Opik che la nuova versione sia corretta
- Testa una conversazione completa

### 3. **Usa Versioni Semantiche**
```bash
# Per piccole modifiche:
v1 → v2 → v3

# Per cambiamenti maggiori:
v1.0 → v1.1 → v2.0
```

### 4. **Backup delle Versioni Precedenti**
Prima di modificare un prompt importante, salvane una copia:
```bash
cp prompts.py prompts.py.backup.v2
```

### 5. **Coerenza dei Nomi**
Quando cambi un nome, cerca TUTTE le occorrenze:
```bash
# Nel progetto API
grep -r "Gio Marco" philoagents-api/src/

# Nel progetto UI
grep -r "Gio Marco" philoagents-ui/src/
```

---

## Comandi Rapidi di Riferimento

```bash
# Modificare prompt e versione
nano philoagents-api/src/philoagents/domain/prompts.py
nano philoagents-api/.env  # Cambia PROMPT_VERSION

# Riavviare con nuovo .env
docker-compose up -d --force-recreate api

# Verificare versione caricata
curl http://localhost:8000/debug/prompt-config

# Vedere logs
docker-compose logs -f api

# Cercare occorrenze di un nome
grep -r "Nome Filosofo" philoagents-api/src/
grep -r "Nome Filosofo" philoagents-ui/src/
```

---

## Riepilogo Veloce

1. ✏️ Modifica [`prompts.py`](src/philoagents/domain/prompts.py) e/o [`philosopher_factory.py`](src/philoagents/domain/philosopher_factory.py)
2. 🔢 Incrementa `PROMPT_VERSION` in [`.env`](../.env)
3. 🔄 `docker-compose up -d --force-recreate api`
4. ✅ Verifica con `curl http://localhost:8000/debug/prompt-config`
5. 🎮 Testa nel gioco e controlla Opik

**Tempo totale**: ~2 minuti (senza rebuild!)

---

Per ulteriori dettagli sul sistema di versioning, vedi [`PROMPT_VERSIONING.md`](PROMPT_VERSIONING.md).