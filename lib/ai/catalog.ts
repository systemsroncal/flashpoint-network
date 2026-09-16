export type AiProviderId =
  | "google"
  | "openai"
  | "xai"
  | "anthropic"
  | "nvidia"
  | "perplexity";

export type AiModelDef = {
  id: string;
  label: string;
  provider: AiProviderId;
  /** Prefer for web-grounded / research-style answers */
  webGrounded?: boolean;
};

export const AI_PROVIDERS: {
  id: AiProviderId;
  label: string;
  settingLabel: string;
}[] = [
  { id: "google", label: "Google Gemini", settingLabel: "Google Gemini API key" },
  { id: "openai", label: "OpenAI", settingLabel: "OpenAI API key" },
  { id: "xai", label: "xAI Grok", settingLabel: "xAI Grok API key" },
  { id: "anthropic", label: "Anthropic Claude", settingLabel: "Anthropic API key" },
  { id: "nvidia", label: "NVIDIA NIM", settingLabel: "NVIDIA NIM API key" },
  {
    id: "perplexity",
    label: "Perplexity",
    settingLabel: "Perplexity API key (optional, web-grounded)",
  },
];

export const AI_MODELS: AiModelDef[] = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "google" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "google" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", provider: "openai" },
  { id: "gpt-4.1", label: "GPT-4.1", provider: "openai" },
  { id: "grok-3-mini", label: "Grok 3 mini", provider: "xai" },
  { id: "grok-3", label: "Grok 3", provider: "xai" },
  { id: "grok-2", label: "Grok 2", provider: "xai" },
  {
    id: "claude-sonnet-4-20250514",
    label: "Claude Sonnet 4",
    provider: "anthropic",
  },
  {
    id: "claude-3-5-haiku-latest",
    label: "Claude 3.5 Haiku",
    provider: "anthropic",
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    label: "Nemotron 70B (NIM)",
    provider: "nvidia",
  },
  {
    id: "nvidia/llama-3.1-nemotron-51b-instruct",
    label: "Nemotron 51B (NIM)",
    provider: "nvidia",
  },
  {
    id: "mistralai/mistral-large-2-instruct",
    label: "Mistral Large 2 (NIM)",
    provider: "nvidia",
  },
  {
    id: "google/gemma-3-12b-it",
    label: "Gemma 3 12B (NIM)",
    provider: "nvidia",
  },
  {
    id: "mistralai/mistral-7b-instruct-v0.3",
    label: "Mistral 7B (NIM)",
    provider: "nvidia",
  },
  {
    id: "sonar",
    label: "Perplexity Sonar",
    provider: "perplexity",
    webGrounded: true,
  },
  {
    id: "sonar-pro",
    label: "Perplexity Sonar Pro",
    provider: "perplexity",
    webGrounded: true,
  },
];

export const AI_KEYS_SETTING = "ai_provider_keys";

export type AiProviderKeys = Partial<Record<AiProviderId, string>>;

export type AiProviderStatus = {
  id: AiProviderId;
  label: string;
  settingLabel: string;
  configured: boolean;
  hint: string | null;
};

export function findAiModel(modelId: string): AiModelDef | undefined {
  const direct = AI_MODELS.find((m) => m.id === modelId);
  if (direct) return direct;
  // Retired NIM IDs → closest current model (avoids EOL 410 after catalog refresh)
  const aliases: Record<string, string> = {
    "meta/llama-3.1-70b-instruct": "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.1-8b-instruct": "mistralai/mistral-7b-instruct-v0.3",
    "meta/llama-3.3-70b-instruct": "nvidia/llama-3.1-nemotron-70b-instruct",
  };
  const mapped = aliases[modelId];
  return mapped ? AI_MODELS.find((m) => m.id === mapped) : undefined;
}
