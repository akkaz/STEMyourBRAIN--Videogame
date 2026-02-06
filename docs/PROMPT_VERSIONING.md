# Prompt Versioning con Opik

## Panoramica

Questo progetto implementa un sistema di versioning per i prompt utilizzati con Opik. Questo permette di aggiornare i prompt nella libreria Opik **senza dover ricostruire i container Docker**, risparmiando tempo durante lo sviluppo.

## Come Funziona

Ogni prompt viene automaticamente versionato aggiungendo un suffisso basato sulla variabile d'ambiente `PROMPT_VERSION`. Per esempio:

- Con `PROMPT_VERSION=v1`: il prompt `philosopher_character_card` diventa `philosopher_character_card_v1`
- Con `PROMPT_VERSION=v2`: il prompt `philosopher_character_card` diventa `philosopher_character_card_v2`

## Come Aggiornare i Prompt

### Metodo 1: Modifica del file .env (Raccomandato)

1. Apri il tuo file `.env` (o crealo copiando `.env.example`)
2. Aggiungi o modifica la variabile `PROMPT_VERSION`:
   ```bash
   PROMPT_VERSION=v2  # Cambia da v1 a v2, v3, etc.
   ```
3. Modifica i tuoi prompt in `src/philoagents/domain/prompts.py`
4. Riavvia solo il container API (NON è necessario rebuild):
   ```bash
   docker-compose restart philoagents-api
   ```
5. I nuovi prompt saranno disponibili in Opik con la nuova versione

### Metodo 2: Variabile d'ambiente inline

Puoi anche passare la versione direttamente al comando:

```bash
PROMPT_VERSION=v2 docker-compose up philoagents-api
```

## Best Practices

1. **Incrementa la versione semanticamente**: Usa `v1`, `v2`, `v3` per cambiamenti minori, o `v1.0`, `v1.1`, `v2.0` per cambiamenti più strutturati
2. **Documenta i cambiamenti**: Tieni traccia delle modifiche ai prompt per ogni versione
3. **Testa prima di deployare**: Verifica i nuovi prompt in ambiente di sviluppo prima di usarli in produzione
4. **Pulizia periodica**: Elimina le vecchie versioni dei prompt da Opik quando non sono più necessarie

## Esempio Completo

```bash
# 1. Modifica i prompt in src/philoagents/domain/prompts.py
# 2. Aggiorna la versione nel .env
echo "PROMPT_VERSION=v2" >> .env

# 3. Riavvia solo le API
docker-compose restart philoagents-api

# 4. I nuovi prompt sono ora disponibili in Opik come:
#    - philosopher_character_card_v2
#    - summary_prompt_v2
#    - etc.
```

## Vantaggi

- ✅ **Nessun rebuild necessario**: Risparmia tempo durante lo sviluppo
- ✅ **Versioning esplicito**: Traccia tutte le versioni dei prompt in Opik
- ✅ **Rollback facile**: Torna a una versione precedente cambiando `PROMPT_VERSION`
- ✅ **CI/CD friendly**: Integrazione semplice nelle pipeline di deployment

## Troubleshooting

### Il prompt non si aggiorna in Opik

- Verifica che `PROMPT_VERSION` sia cambiata nel file `.env`
- Assicurati di aver riavviato il container: `docker-compose restart philoagents-api`
- Controlla i log per eventuali errori: `docker-compose logs philoagents-api`

### Errore "Can't use Opik to version the prompt"

- Verifica che `COMET_API_KEY` sia configurata correttamente nel `.env`
- Verifica la connettività con il server Opik
- Il sistema continuerà a funzionare usando i prompt locali (senza versioning)

## Implementazione Tecnica

Il sistema è implementato in:
- [`src/philoagents/config.py`](src/philoagents/config.py): Definizione di `PROMPT_VERSION`
- [`src/philoagents/domain/prompts.py`](src/philoagents/domain/prompts.py): Classe `Prompt` con versioning automatico