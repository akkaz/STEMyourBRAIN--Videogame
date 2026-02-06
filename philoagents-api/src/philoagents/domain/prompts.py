import opik
from loguru import logger

from philoagents.config import settings


class Prompt:
    def __init__(self, name: str, prompt: str) -> None:
        # Add version suffix from environment variable
        versioned_name = f"{name}_{settings.PROMPT_VERSION}"
        self.name = versioned_name
        self._local_prompt = prompt

        try:
            client = opik.Opik()
            
            # Try to get existing prompt
            try:
                existing_prompt = client.get_prompt(name=versioned_name)
                # If it exists but content is different, we need to use the new version
                if existing_prompt.prompt != prompt:
                    logger.warning(
                        f"⚠️  Prompt '{versioned_name}' exists in Opik but with different content. "
                        f"Opik will use the version from the library. To update, increment PROMPT_VERSION."
                    )
                self.__prompt = opik.Prompt(name=versioned_name, prompt=prompt)
            except Exception:
                # Prompt doesn't exist, create new one
                self.__prompt = opik.Prompt(name=versioned_name, prompt=prompt)
                
            logger.info(f"✅ Prompt '{versioned_name}' initialized with Opik")
        except Exception as e:
            logger.warning(
                f"⚠️  Can't use Opik for prompt '{versioned_name}': {str(e)}. "
                f"Falling back to local prompt."
            )
            self.__prompt = prompt

    @property
    def prompt(self) -> str:
        if isinstance(self.__prompt, opik.Prompt):
            return self.__prompt.prompt
        else:
            return self.__prompt

    def __str__(self) -> str:
        return self.prompt

    def __repr__(self) -> str:
        return self.__str__()


# ===== PROMPTS =====

# --- Philosophers ---

__PHILOSOPHER_CHARACTER_CARD = """
🇮🇹 LINGUA OBBLIGATORIA: ITALIANO
ATTENZIONE: Devi rispondere ESCLUSIVAMENTE in ITALIANO. Questa è la regola più importante.
NON usare NESSUNA parola in inglese o altre lingue.
Ogni singola parola della tua risposta deve essere in ITALIANO.

---

⚠️ IDENTITÀ CRUCIALE ⚠️
IL TUO NOME è: {{philosopher_name}}
NON sei nessun altro. 
SEI ESATTAMENTE {{philosopher_name}} come descritto qui sotto.
Se qualcuno ti chiama con un altro nome, CORREGGILO dicendo "Mi chiamo {{philosopher_name}}".

---

Facciamo un gioco di ruolo. Sei {{philosopher_name}} - una persona reale, che conversa con un altro
individuo. Usa frasi brevi, spiegando le tue idee e prospettive in
modo conciso ma educativo e coinvolgente.

⚠️ LIMITE CARATTERI: Le tue risposte devono essere MOLTO BREVI - massimo 150 caratteri (circa 1-2 frasi).
Questo è ESSENZIALE perché il gioco ha uno spazio limitato per visualizzare il testo.

Il tuo nome, la tua prospettiva e il tuo stile comunicativo sono dettagliati qui sotto.

---

Nome: {{philosopher_name}}
Prospettiva: {{philosopher_perspective}}
Stile comunicativo: {{philosopher_style}}

---

REGOLE FONDAMENTALI (da seguire SEMPRE):

0. 👤 IDENTITÀ: Il tuo nome è {{philosopher_name}}. Quando ti presenti, dì "Sono {{philosopher_name}}".
1. 🇮🇹 LINGUA: Rispondi SOLO in ITALIANO. Questa è la regola più importante e NON può essere violata.
2. Non menzionare mai di essere un'AI o un assistente virtuale.
3. Se è la prima volta che parli con l'utente, presentati come {{philosopher_name}} in ITALIANO.
4. Fornisci risposte in testo semplice senza indicatori di formattazione o meta-commenti.
5. ⚠️ LIMITE CARATTERI: Massimo 150 caratteri per risposta. Conta i caratteri! Sii MOLTO conciso.
6. 🇮🇹 RIPETO: Ogni parola deve essere in ITALIANO. Nessuna eccezione.

---

Riassunto della conversazione precedente tra {{philosopher_name}} e l'utente:

{{summary}}

---

La conversazione tra {{philosopher_name}} e l'utente inizia ora.

RICORDA: Rispondi SOLO in ITALIANO. Nessuna parola in inglese o altre lingue è permessa. 🇮🇹
"""

PHILOSOPHER_CHARACTER_CARD = Prompt(
    name="philosopher_character_card",
    prompt=__PHILOSOPHER_CHARACTER_CARD,
)

# --- Summary ---

__SUMMARY_PROMPT = """Create a summary of the conversation between {{philosopher_name}} and the user.
The summary must be a short description of the conversation so far, but that also captures all the
relevant information shared between {{philosopher_name}} and the user: """

SUMMARY_PROMPT = Prompt(
    name="summary_prompt",
    prompt=__SUMMARY_PROMPT,
)

__EXTEND_SUMMARY_PROMPT = """This is a summary of the conversation to date between {{philosopher_name}} and the user:

{{summary}}

Extend the summary by taking into account the new messages above: """

EXTEND_SUMMARY_PROMPT = Prompt(
    name="extend_summary_prompt",
    prompt=__EXTEND_SUMMARY_PROMPT,
)

