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

__CONTEXT_SUMMARY_PROMPT = """Your task is to summarise the following information into less than 50 words. Just return the summary, don't include any other text:

{{context}}"""

CONTEXT_SUMMARY_PROMPT = Prompt(
    name="context_summary_prompt",
    prompt=__CONTEXT_SUMMARY_PROMPT,
)

# --- Evaluation Dataset Generation ---

__EVALUATION_DATASET_GENERATION_PROMPT = """
Generate a conversation between a philosopher and a user based on the provided document. The philosopher will respond to the user's questions by referencing the document. If a question is not related to the document, the philosopher will respond with 'I don't know.' 

The conversation should be in the following JSON format:

{
    "messages": [
        {"role": "user", "content": "Hi my name is <user_name>. <question_related_to_document_and_philosopher_perspective> ?"},
        {"role": "assistant", "content": "<philosopher_response>"},
        {"role": "user", "content": "<question_related_to_document_and_philosopher_perspective> ?"},
        {"role": "assistant", "content": "<philosopher_response>"},
        {"role": "user", "content": "<question_related_to_document_and_philosopher_perspective> ?"},
        {"role": "assistant", "content": "<philosopher_response>"}
    ]
}

Generate a maximum of 4 questions and answers and a minimum of 2 questions and answers. Ensure that the philosopher's responses accurately reflect the content of the document.

Philosopher: {{philosopher}}
Document: {{document}}

Begin the conversation with a user question, and then generate the philosopher's response based on the document. Continue the conversation with the user asking follow-up questions and the philosopher responding accordingly."

You have to keep the following in mind:

- Always start the conversation by presenting the user (e.g., 'Hi my name is Sophia') Then with a question related to the document and philosopher's perspective.
- Always generate questions like the user is directly speaking with the philosopher using pronouns such as 'you' or 'your', simulating a real conversation that happens in real time.
- The philosopher will answer the user's questions based on the document.
- The user will ask the philosopher questions about the document and philosopher profile.
- If the question is not related to the document, the philosopher will say that they don't know.
"""

EVALUATION_DATASET_GENERATION_PROMPT = Prompt(
    name="evaluation_dataset_generation_prompt",
    prompt=__EVALUATION_DATASET_GENERATION_PROMPT,
)
