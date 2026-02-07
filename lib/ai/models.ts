// Default models available via OpenRouter
// Users can add/remove models from the UI using OpenRouter model IDs
export const DEFAULT_CHAT_MODEL = "google/gemini-2.5-flash-lite";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

// These are the built-in defaults. Custom models are stored in localStorage.
export const defaultChatModels: ChatModel[] = [
  // Anthropic
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Most capable Anthropic model",
  },
  // OpenAI
  {
    id: "openai/gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    description: "Fast and cost-effective for simple tasks",
  },
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    provider: "openai",
    description: "Most capable OpenAI model",
  },
  // Google
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Ultra fast and affordable",
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    provider: "google",
    description: "Fast reasoning and agentic workflows",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    provider: "google",
    description: "Most capable Google model",
  },
  // xAI
  {
    id: "x-ai/grok-4.1-fast",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast with 2M context window",
  },
  // Meta
  {
    id: "meta-llama/llama-4-scout",
    name: "Llama 4 Scout",
    provider: "meta",
    description: "Open-source multimodal, 10M context",
  },
  // DeepSeek
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    description: "Strong reasoning at low cost",
  },
];

// backward compat: chatModels is used by the server-side code
export const chatModels = defaultChatModels;

// Helper to extract provider from model ID
export function getProviderFromId(id: string): string {
  const prefix = id.split("/")[0];
  const providerMap: Record<string, string> = {
    "anthropic": "anthropic",
    "openai": "openai",
    "google": "google",
    "x-ai": "xai",
    "meta-llama": "meta",
    "deepseek": "deepseek",
    "mistralai": "mistral",
    "qwen": "qwen",
    "moonshotai": "moonshot",
    "minimax": "minimax",
  };
  return providerMap[prefix] || prefix;
}

// Group models by provider for UI
export function groupModelsByProvider(models: ChatModel[]) {
  return models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, ChatModel[]>,
  );
}

export const modelsByProvider = groupModelsByProvider(defaultChatModels);
