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

/**
 * NVIDIA Integrate API (https://integrate.api.nvidia.com/v1) model IDs.
 * Sourced from docs.api.nvidia.com/nim/reference/llm-apis (2026 catalog).
 * Prefer Nano / Mini first — more often entitled on free build.nvidia.com keys.
 */
export const NVIDIA_INTEGRATE_MODELS: AiModelDef[] = [
  {
    id: "nvidia/llama-3.1-nemotron-nano-8b-v1",
    label: "Nemotron Nano 8B (recommended)",
    provider: "nvidia",
  },
  {
    id: "nvidia/nvidia-nemotron-nano-9b-v2",
    label: "Nemotron Nano 9B v2",
    provider: "nvidia",
  },
  {
    id: "nvidia/nemotron-mini-4b-instruct",
    label: "Nemotron Mini 4B",
    provider: "nvidia",
  },
  {
    id: "microsoft/phi-4-mini-instruct",
    label: "Phi-4 Mini (NIM)",
    provider: "nvidia",
  },
  {
    id: "mistralai/mistral-nemotron",
    label: "Mistral Nemotron (NIM)",
    provider: "nvidia",
  },
  {
    id: "deepseek-ai/deepseek-v4-flash",
    label: "DeepSeek V4 Flash (NIM)",
    provider: "nvidia",
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B (NIM)",
    provider: "nvidia",
  },
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    label: "Nemotron Super 49B v1.5",
    provider: "nvidia",
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B (NIM)",
    provider: "nvidia",
  },
];

/** Tried automatically when the selected NVIDIA model returns function-not-found. */
export const NVIDIA_FALLBACK_MODEL_IDS: string[] = [
  "nvidia/llama-3.1-nemotron-nano-8b-v1",
  "nvidia/nvidia-nemotron-nano-9b-v2",
  "nvidia/nemotron-mini-4b-instruct",
  "microsoft/phi-4-mini-instruct",
  "deepseek-ai/deepseek-v4-flash",
  "mistralai/mistral-nemotron",
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
  ...NVIDIA_INTEGRATE_MODELS,
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

/** Retired / wrong catalog IDs → current Integrate API IDs */
const NVIDIA_ALIASES: Record<string, string> = {
  "meta/llama-3.1-70b-instruct": "meta/llama-3.3-70b-instruct",
  "meta/llama-3.1-8b-instruct": "nvidia/llama-3.1-nemotron-nano-8b-v1",
  "nvidia/llama-3.1-nemotron-70b-instruct":
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "nvidia/llama-3.1-nemotron-51b-instruct":
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "mistralai/mistral-large-2-instruct": "mistralai/mistral-nemotron",
  "mistralai/mistral-7b-instruct-v0.3": "mistralai/mistral-nemotron",
  "mistralai/mistral-7b-instruct": "mistralai/mistral-nemotron",
  "google/gemma-3-12b-it": "microsoft/phi-4-mini-instruct",
  "google/gemma-2-9b-it": "microsoft/phi-4-mini-instruct",
};

export function findAiModel(modelId: string): AiModelDef | undefined {
  const direct = AI_MODELS.find((m) => m.id === modelId);
  if (direct) return direct;
  const mapped = NVIDIA_ALIASES[modelId];
  return mapped ? AI_MODELS.find((m) => m.id === mapped) : undefined;
}

export const NVIDIA_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

export const NVIDIA_MODELS_LIST_URL =
  "https://integrate.api.nvidia.com/v1/models";
