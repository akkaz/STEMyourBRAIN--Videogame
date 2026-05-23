import { Container } from "@cloudflare/containers";

interface Env {
  API_CONTAINER: DurableObjectNamespace<BabiloniaApi>;
  MONGO_URI: string;
  OPENAI_API_KEY: string;
  LLM_PROVIDER: string;
  LLM_MODEL: string;
  LLM_MODEL_SUMMARY: string;
  LLM_MODEL_CONTEXT_SUMMARY: string;
  PROMPT_VERSION: string;
}

export class BabiloniaApi extends Container<Env> {
  defaultPort = 8000;
  sleepAfter = "10m";

  override envVars = {
    PORT: "8000",
    MONGO_URI: this.env.MONGO_URI,
    OPENAI_API_KEY: this.env.OPENAI_API_KEY,
    LLM_PROVIDER: this.env.LLM_PROVIDER,
    LLM_MODEL: this.env.LLM_MODEL,
    LLM_MODEL_SUMMARY: this.env.LLM_MODEL_SUMMARY,
    LLM_MODEL_CONTEXT_SUMMARY: this.env.LLM_MODEL_CONTEXT_SUMMARY,
    PROMPT_VERSION: this.env.PROMPT_VERSION,
  };

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/__admin/restart-container") {
      // Forza il restart del container per ricaricare envVars dopo update dei secret.
      // Lasciato attivo per comodità operativa; rimuovi se vuoi superficie minima.
      await this.destroy();
      return new Response("container destroyed; next request cold-starts", { status: 200 });
    }
    return super.fetch(request);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.API_CONTAINER.idFromName("singleton");
    const stub = env.API_CONTAINER.get(id);
    return stub.fetch(request);
  },
};
