import "server-only";

import {
  findAiModel,
  NVIDIA_CHAT_COMPLETIONS_URL,
  NVIDIA_FALLBACK_MODEL_IDS,
  type AiProviderId,
  type AiProviderKeys,
} from "@/lib/ai/catalog";

export type GenerateNewsInput = {
  prompt: string;
  modelId: string;
  keys: AiProviderKeys;
  fillTitle: boolean;
  fillExcerpt: boolean;
};

export type GenerateNewsResult = {
  title?: string;
  excerpt?: string;
  bodyHtml: string;
  researchNotes?: string;
  mock?: boolean;
  /** When a fallback NVIDIA model was used instead of the selected one */
  usedModelId?: string;
};

export class ProviderHttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ProviderHttpError";
    this.status = status;
  }
}

function mockArticle(input: GenerateNewsInput): GenerateNewsResult {
  const topic = input.prompt.slice(0, 120).replace(/\s+/g, " ").trim();
  const title = input.fillTitle
    ? `FlashPoint desk draft: ${topic.slice(0, 72) || "Untitled"}`
    : undefined;
  const excerpt = input.fillExcerpt
    ? `A newsroom draft generated locally without a live provider key. Topic: ${topic.slice(0, 140)}.`
    : undefined;
  const bodyHtml = [
    `<p><em>Mock AI draft</em> — no live API key was used. Add <code>AI_NVIDIA_API_KEY</code> (nvapi-… from build.nvidia.com) on the server for real generation.</p>`,
    `<p>Assignment: ${escapeHtml(topic || "general coverage")}</p>`,
    `<h2>What we know</h2>`,
    `<p>Editors should replace this placeholder with reported facts, attributed quotes, and verified context before publishing.</p>`,
    `<h2>Why it matters</h2>`,
    `<p>This scaffold keeps the News AI button functional in development and on misconfigured hosts so workflows are not blocked.</p>`,
    `<ul><li>Verify sources</li><li>Update the dek and headline</li><li>Remove the mock notice</li></ul>`,
  ].join("");
  return { title, excerpt, bodyHtml, mock: true };
}

async function gatherWebNotes(query: string): Promise<string> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FlashPointNetworkBot/1.0; +https://fpnetwork.local)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const snippets: string[] = [];
    const re =
      /class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__a"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && snippets.length < 8) {
      const raw = (m[1] || m[2] || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (raw.length > 40) snippets.push(raw.slice(0, 280));
    }
    return snippets.map((s, i) => `${i + 1}. ${s}`).join("\n");
  } catch {
    return "";
  }
}

function buildSystemPrompt() {
  return `You are a newsroom writing assistant for Flash Point Network.
Return ONLY a single JSON object (no markdown fences) with keys:
- "title": string (headline)
- "excerpt": string (1-2 sentence dek)
- "bodyHtml": string (HTML for TipTap: use <p>, <h2>, <h3>, <ul>, <ol>, <blockquote>, <a> only; 6-10 paragraphs of real news-style prose; no scripts)

Write in clear English journalistic style. Use the research notes when provided; do not invent sourced quotes. If research is thin, write carefully hedged copy.`;
}

function buildUserPrompt(
  prompt: string,
  researchNotes: string,
  fillTitle: boolean,
  fillExcerpt: boolean,
) {
  return `Assignment / instruction:
${prompt}

Research notes (may be empty):
${researchNotes || "(none)"}

Fill title: ${fillTitle ? "yes" : "prefer a title anyway in JSON"}
Fill excerpt: ${fillExcerpt ? "yes" : "prefer an excerpt anyway in JSON"}
Always provide bodyHtml.`;
}

function extractJson(text: string): {
  title?: string;
  excerpt?: string;
  bodyHtml: string;
} {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return { bodyHtml: toParagraphs(raw) };
  }
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      title?: string;
      excerpt?: string;
      bodyHtml?: string;
      body?: string;
    };
    const bodyHtml =
      parsed.bodyHtml?.trim() ||
      (parsed.body ? toParagraphs(parsed.body) : "") ||
      "<p></p>";
    return {
      title: parsed.title?.trim() || undefined,
      excerpt: parsed.excerpt?.trim() || undefined,
      bodyHtml,
    };
  } catch {
    return { bodyHtml: toParagraphs(raw) };
  }
}

function toParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("") || "<p></p>";
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** NVIDIA / OpenAI-compatible error bodies vary: error.message, detail, title. */
function providerErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== "object") {
    return `Provider error (${status})`;
  }
  const obj = data as Record<string, unknown>;
  const nested = obj.error;
  if (nested && typeof nested === "object") {
    const msg = (nested as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail.trim();
  if (typeof obj.title === "string" && obj.title.trim()) {
    const detail =
      typeof obj.detail === "string" && obj.detail.trim()
        ? `: ${obj.detail.trim()}`
        : "";
    return `${obj.title}${detail} (${status})`;
  }
  if (typeof obj.message === "string" && obj.message.trim()) return obj.message.trim();
  return `Provider error (${status})`;
}

export function isNvidiaFunctionNotFound(message: string): boolean {
  return /function\s+['`]?[0-9a-f-]{8,}['`]?\s*:\s*not found for account/i.test(
    message,
  ) || /not found for account/i.test(message);
}

function actionableNvidiaMessage(raw: string, modelId: string): string {
  if (isNvidiaFunctionNotFound(raw) || /404|not found/i.test(raw)) {
    return (
      `NVIDIA model "${modelId}" is not available for this API key ` +
      `(function not found / not entitled on integrate.api.nvidia.com). ` +
      `Pick another model (try Nemotron Nano 8B) or generate a new nvapi- key at build.nvidia.com. ` +
      `Raw: ${raw}`
    );
  }
  if (/end of life|no longer available|Gone|410/i.test(raw)) {
    return (
      `${raw} This model ID was retired. Pick Nemotron Nano 8B or another current NVIDIA model from the list.`
    );
  }
  return raw;
}

async function callOpenAiCompatible(options: {
  endpoint: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  extraHeaders?: Record<string, string>;
}): Promise<string> {
  const res = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
      Accept: "application/json",
      ...(options.extraHeaders || {}),
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.5,
      max_tokens: options.maxTokens ?? 4096,
      stream: false,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ProviderHttpError(providerErrorMessage(data, res.status), res.status);
  }
  const choices = data.choices as
    | { message?: { content?: string } }[]
    | undefined;
  const content = choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty model response");
  return content;
}

async function callAnthropic(
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(90000),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ProviderHttpError(providerErrorMessage(data, res.status), res.status);
  }
  const content = data.content as { type: string; text?: string }[] | undefined;
  const text = content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.5 },
    }),
    signal: AbortSignal.timeout(90000),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ProviderHttpError(providerErrorMessage(data, res.status), res.status);
  }
  const candidates = data.candidates as
    | { content?: { parts?: { text?: string }[] } }[]
    | undefined;
  const text = candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function invokeProvider(
  provider: AiProviderId,
  modelId: string,
  apiKey: string,
  system: string,
  user: string,
): Promise<string> {
  switch (provider) {
    case "openai":
      return callOpenAiCompatible({
        endpoint: "https://api.openai.com/v1/chat/completions",
        apiKey,
        model: modelId,
        system,
        user,
      });
    case "xai":
      return callOpenAiCompatible({
        endpoint: "https://api.x.ai/v1/chat/completions",
        apiKey,
        model: modelId,
        system,
        user,
      });
    case "nvidia":
      return callOpenAiCompatible({
        endpoint: NVIDIA_CHAT_COMPLETIONS_URL,
        apiKey,
        model: modelId,
        system,
        user,
        maxTokens: 4096,
      });
    case "perplexity":
      return callOpenAiCompatible({
        endpoint: "https://api.perplexity.ai/chat/completions",
        apiKey,
        model: modelId,
        system,
        user,
      });
    case "anthropic":
      return callAnthropic(apiKey, modelId, system, user);
    case "google":
      return callGemini(apiKey, modelId, system, user);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

function shouldRetryNvidia(err: unknown): boolean {
  if (err instanceof ProviderHttpError) {
    if (err.status === 404 || err.status === 410) return true;
    return isNvidiaFunctionNotFound(err.message);
  }
  if (err instanceof Error) {
    return isNvidiaFunctionNotFound(err.message) || /end of life|Gone/i.test(err.message);
  }
  return false;
}

async function invokeNvidiaWithFallback(
  preferredModelId: string,
  apiKey: string,
  system: string,
  user: string,
): Promise<{ content: string; usedModelId: string }> {
  const tried = new Set<string>();
  const queue = [
    preferredModelId,
    ...NVIDIA_FALLBACK_MODEL_IDS.filter((id) => id !== preferredModelId),
  ];

  let lastError: unknown;
  for (const modelId of queue) {
    if (tried.has(modelId)) continue;
    tried.add(modelId);
    try {
      const content = await invokeProvider("nvidia", modelId, apiKey, system, user);
      return { content, usedModelId: modelId };
    } catch (err) {
      lastError = err;
      if (!shouldRetryNvidia(err)) break;
      console.warn(
        `[ai/generate] NVIDIA model ${modelId} failed; trying fallback:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const raw =
    lastError instanceof Error ? lastError.message : "NVIDIA generation failed";
  const status =
    lastError instanceof ProviderHttpError ? lastError.status : 502;
  throw new ProviderHttpError(
    actionableNvidiaMessage(raw, preferredModelId),
    status === 404 || status === 410 ? 400 : status >= 400 && status < 600 ? status : 502,
  );
}

export async function generateNewsArticle(
  input: GenerateNewsInput,
): Promise<GenerateNewsResult> {
  if (process.env.AI_MOCK === "1" || process.env.AI_MOCK === "true") {
    return mockArticle(input);
  }

  const model = findAiModel(input.modelId);
  if (!model) {
    throw new ProviderHttpError(
      `Unknown model "${input.modelId}". Refresh the page and pick a current NVIDIA model (e.g. Nemotron Nano 8B).`,
      400,
    );
  }
  const apiKey = input.keys[model.provider]?.trim();
  if (!apiKey) {
    // Missing key: mock draft so Generate always works; UI shows mock banner.
    return mockArticle(input);
  }

  let researchNotes = "";
  if (model.webGrounded && model.provider === "perplexity") {
    researchNotes = "(Perplexity model will perform its own web research.)";
  } else if (input.keys.perplexity && model.provider !== "perplexity") {
    try {
      const research = await callOpenAiCompatible({
        endpoint: "https://api.perplexity.ai/chat/completions",
        apiKey: input.keys.perplexity,
        model: "sonar",
        system:
          "Summarize the latest relevant facts for a news desk in 8 short bullet points. No fluff.",
        user: input.prompt,
        maxTokens: 1024,
      });
      researchNotes = research;
    } catch {
      researchNotes = await gatherWebNotes(input.prompt);
    }
  } else {
    researchNotes = await gatherWebNotes(input.prompt);
  }

  const system = buildSystemPrompt();
  const user = buildUserPrompt(
    input.prompt,
    researchNotes,
    input.fillTitle,
    input.fillExcerpt,
  );

  try {
    if (model.provider === "nvidia") {
      const { content, usedModelId } = await invokeNvidiaWithFallback(
        model.id,
        apiKey,
        system,
        user,
      );
      const parsed = extractJson(content);
      return {
        title: input.fillTitle ? parsed.title : undefined,
        excerpt: input.fillExcerpt ? parsed.excerpt : undefined,
        bodyHtml: parsed.bodyHtml,
        researchNotes: researchNotes || undefined,
        usedModelId,
      };
    }

    const raw = await invokeProvider(
      model.provider,
      model.id,
      apiKey,
      system,
      user,
    );
    const parsed = extractJson(raw);
    return {
      title: input.fillTitle ? parsed.title : undefined,
      excerpt: input.fillExcerpt ? parsed.excerpt : undefined,
      bodyHtml: parsed.bodyHtml,
      researchNotes: researchNotes || undefined,
      usedModelId: model.id,
    };
  } catch (err) {
    if (err instanceof ProviderHttpError) throw err;
    const message = err instanceof Error ? err.message : "Generation failed";
    if (model.provider === "nvidia") {
      throw new ProviderHttpError(actionableNvidiaMessage(message, model.id), 400);
    }
    throw new Error(message);
  }
}
