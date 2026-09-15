import "server-only";

import {
  findAiModel,
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
};

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

async function callOpenAiCompatible(options: {
  endpoint: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  extraHeaders?: Record<string, string>;
}): Promise<string> {
  const res = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
      ...(options.extraHeaders || {}),
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.5,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Provider error (${res.status})`);
  }
  const content = data.choices?.[0]?.message?.content;
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
  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    content?: { type: string; text?: string }[];
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Anthropic error (${res.status})`);
  }
  const text = data.content?.find((c) => c.type === "text")?.text;
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
  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini error (${res.status})`);
  }
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("");
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
        endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
        apiKey,
        model: modelId,
        system,
        user,
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

export async function generateNewsArticle(
  input: GenerateNewsInput,
): Promise<GenerateNewsResult> {
  const model = findAiModel(input.modelId);
  if (!model) throw new Error("Unknown model");
  const apiKey = input.keys[model.provider]?.trim();
  if (!apiKey) {
    throw new Error(
      `No API key configured for ${model.provider}. Add it in Settings.`,
    );
  }

  let researchNotes = "";
  if (model.webGrounded && model.provider === "perplexity") {
    researchNotes =
      "(Perplexity model will perform its own web research.)";
  } else if (input.keys.perplexity && model.provider !== "perplexity") {
    // Optional: quick Perplexity research pass
    try {
      const research = await callOpenAiCompatible({
        endpoint: "https://api.perplexity.ai/chat/completions",
        apiKey: input.keys.perplexity,
        model: "sonar",
        system:
          "Summarize the latest relevant facts for a news desk in 8 short bullet points. No fluff.",
        user: input.prompt,
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
  };
}
