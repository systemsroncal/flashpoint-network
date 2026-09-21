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
  /** Existing CMS categories the model may choose from. */
  categories?: { id: string; name: string; slug: string }[];
  /** Existing CMS tags the model may choose from. */
  tags?: { id: string; name: string; slug: string }[];
};

export type GenerateNewsResult = {
  title?: string;
  excerpt?: string;
  bodyHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Comma-separated focus keywords / meta keywords */
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  tagIds?: string[];
  tagSlugs?: string[];
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
  const focus = topic.split(/\s+/).slice(0, 3).join(" ") || "FlashPoint";
  const title = input.fillTitle
    ? `FlashPoint desk draft: ${topic.slice(0, 72) || "Untitled"}`
    : undefined;
  const excerpt = input.fillExcerpt
    ? `A newsroom draft generated locally without a live provider key. Topic: ${topic.slice(0, 140)}.`
    : undefined;
  const bodyHtml = [
    `<p><em>Mock AI draft</em> — no live API key was used. Add <code>AI_NVIDIA_API_KEY</code> (nvapi-… from build.nvidia.com) on the server for real generation.</p>`,
    `<p>Assignment: <strong>${escapeHtml(topic || "general coverage")}</strong>. Editors should replace this placeholder with reported facts.</p>`,
    `<h2>What we know</h2>`,
    `<p>Use <strong>${escapeHtml(focus)}</strong> as the working focus while you verify sources and attributed quotes.</p>`,
    `<h2>Why it matters</h2>`,
    `<p>This scaffold keeps the News AI button functional in development. Prefer real HTML with <em>emphasis</em>, <u>key terms</u>, and <a href="https://fptn.com" rel="noopener noreferrer" target="_blank">internal links</a>.</p>`,
    `<ul><li>Verify sources</li><li>Update SEO meta fields</li><li>Remove the mock notice</li></ul>`,
  ].join("");
  const cats = input.categories ?? [];
  const tags = input.tags ?? [];
  const pickCat =
    cats.find((c) => /us|politics|world/i.test(c.slug)) ?? cats[0] ?? null;
  const pickTags = tags.slice(0, 3);
  return {
    title,
    excerpt,
    bodyHtml,
    seoTitle: title
      ? `${title.slice(0, 50)} | FlashPoint Television Network`.slice(0, 60)
      : `FlashPoint coverage | ${focus}`.slice(0, 60),
    seoDescription: (
      excerpt ||
      `FlashPoint Television Network coverage of ${topic || "today's top stories"}.`
    ).slice(0, 160),
    seoKeywords: [focus, ...pickTags.map((t) => t.name)]
      .filter(Boolean)
      .slice(0, 6)
      .join(", "),
    ogTitle: title,
    ogDescription: excerpt,
    categoryId: pickCat?.id ?? null,
    categorySlug: pickCat?.slug ?? null,
    tagIds: pickTags.map((t) => t.id),
    tagSlugs: pickTags.map((t) => t.slug),
    mock: true,
  };
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

function buildSystemPrompt(catalog: {
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
}) {
  const catList =
    catalog.categories.length > 0
      ? catalog.categories.map((c) => `${c.slug} (${c.name})`).join(", ")
      : "(none provided)";
  const tagList =
    catalog.tags.length > 0
      ? catalog.tags.map((t) => `${t.slug} (${t.name})`).join(", ")
      : "(none provided)";

  return `You are a senior SEO newsroom writing assistant for FlashPoint Television Network (FPTN).
Return ONLY a single JSON object (no markdown fences) with these keys:
- "title": string (news headline, ~60–90 chars)
- "excerpt": string (1–2 sentence dek / standfirst)
- "bodyHtml": string (TipTap HTML — NEVER plain text walls)
- "seoTitle": string (meta title, 50–60 characters, include primary keyword)
- "seoDescription": string (meta description, 150–160 characters, include primary keyword once)
- "seoKeywords": string (comma-separated focus keywords; primary keyword first)
- "ogTitle": string (Open Graph title; may match seoTitle)
- "ogDescription": string (Open Graph description; may match seoDescription)
- "categorySlug": string (MUST be one of the allowed category slugs below, or "")
- "tagSlugs": string[] (0–5 slugs from the allowed tag list below)

Allowed category slugs: ${catList}
Allowed tag slugs: ${tagList}

bodyHtml SEO rules (required):
- Use only: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <u>, <a>
- Structure: lede <p>, then 2–4 <h2> sections with multiple <p> blocks (6–12 paragraphs total)
- Bold (<strong>) the primary focus keyword 2–4 times naturally (not stuffed)
- Use <em> for attribution / nuance; <u> sparingly on 1–2 key phrases
- Include 1–3 <a href="https://..."> links to reputable sources when research notes include URLs; otherwise link to https://fptn.com where natural
- Use at least one list OR blockquote
- No <script>, <style>, inline event handlers, or markdown

Write clear English journalistic copy. Use research notes; do not invent sourced quotes. If research is thin, hedge carefully.`;
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

Fill title field: ${fillTitle ? "yes — put best headline in title" : "still return title in JSON for SEO"}
Fill excerpt field: ${fillExcerpt ? "yes — put dek in excerpt" : "still return excerpt in JSON"}
Always provide bodyHtml, seoTitle, seoDescription, seoKeywords, ogTitle, ogDescription, categorySlug, and tagSlugs.`;
}

type ParsedArticle = {
  title?: string;
  excerpt?: string;
  bodyHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  categorySlug?: string;
  tagSlugs?: string[];
};

function extractJson(text: string): ParsedArticle {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return { bodyHtml: sanitizeBodyHtml(toParagraphs(raw)) };
  }
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      title?: string;
      excerpt?: string;
      bodyHtml?: string;
      body?: string;
      seoTitle?: string;
      seo_title?: string;
      seoDescription?: string;
      seo_description?: string;
      seoKeywords?: string;
      seo_keywords?: string;
      focusKeyword?: string;
      focus_keyword?: string;
      ogTitle?: string;
      og_title?: string;
      ogDescription?: string;
      og_description?: string;
      categorySlug?: string;
      category_slug?: string;
      tagSlugs?: unknown;
      tag_slugs?: unknown;
      tags?: unknown;
    };
    const bodyHtml = sanitizeBodyHtml(
      parsed.bodyHtml?.trim() ||
        (parsed.body ? toParagraphs(parsed.body) : "") ||
        "<p></p>",
    );
    const tagSlugs = normalizeSlugList(
      parsed.tagSlugs ?? parsed.tag_slugs ?? parsed.tags,
    );
    const focus =
      parsed.focusKeyword?.trim() ||
      parsed.focus_keyword?.trim() ||
      undefined;
    let seoKeywords =
      parsed.seoKeywords?.trim() ||
      parsed.seo_keywords?.trim() ||
      undefined;
    if (focus && !seoKeywords) seoKeywords = focus;
    if (focus && seoKeywords && !seoKeywords.toLowerCase().includes(focus.toLowerCase())) {
      seoKeywords = `${focus}, ${seoKeywords}`;
    }
    return {
      title: parsed.title?.trim() || undefined,
      excerpt: parsed.excerpt?.trim() || undefined,
      bodyHtml,
      seoTitle: (parsed.seoTitle || parsed.seo_title)?.trim() || undefined,
      seoDescription:
        (parsed.seoDescription || parsed.seo_description)?.trim() || undefined,
      seoKeywords,
      ogTitle: (parsed.ogTitle || parsed.og_title)?.trim() || undefined,
      ogDescription:
        (parsed.ogDescription || parsed.og_description)?.trim() || undefined,
      categorySlug:
        (parsed.categorySlug || parsed.category_slug)?.trim() || undefined,
      tagSlugs,
    };
  } catch {
    return { bodyHtml: sanitizeBodyHtml(toParagraphs(raw)) };
  }
}

function normalizeSlugList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  }
  if (typeof value === "string") {
    return value
      .split(/[,|]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  }
  return [];
}

/** Keep TipTap-safe SEO markup; strip scripts and event handlers. */
export function sanitizeBodyHtml(html: string): string {
  let s = String(html || "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/<\/?(?:html|body|head|iframe|object|embed|form|input|button)[^>]*>/gi, "");
  // Prefer semantic strong over b; em over i
  s = s.replace(/<\/?b\b/gi, (m) => m.replace(/b/i, "strong"));
  s = s.replace(/<\/?i\b/gi, (m) => m.replace(/i/i, "em"));
  if (!/<[a-z][\s\S]*>/i.test(s.trim())) {
    return toParagraphs(s);
  }
  return s.trim() || "<p></p>";
}

function resolveTaxonomy(
  parsed: ParsedArticle,
  categories: { id: string; name: string; slug: string }[],
  tags: { id: string; name: string; slug: string }[],
): Pick<
  GenerateNewsResult,
  "categoryId" | "categorySlug" | "tagIds" | "tagSlugs"
> {
  const catSlug = (parsed.categorySlug || "").toLowerCase();
  const cat =
    categories.find((c) => c.slug.toLowerCase() === catSlug) ||
    categories.find(
      (c) =>
        catSlug &&
        (c.name.toLowerCase() === catSlug ||
          c.name.toLowerCase().includes(catSlug)),
    ) ||
    null;

  const wanted = new Set((parsed.tagSlugs || []).map((s) => s.toLowerCase()));
  // Also match keywords to tag names
  const keywordBits = (parsed.seoKeywords || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  for (const k of keywordBits) wanted.add(k);

  const matched = tags.filter(
    (t) =>
      wanted.has(t.slug.toLowerCase()) ||
      wanted.has(t.name.toLowerCase()) ||
      keywordBits.some(
        (k) => t.name.toLowerCase().includes(k) || k.includes(t.name.toLowerCase()),
      ),
  );
  const unique = [...new Map(matched.map((t) => [t.id, t])).values()].slice(0, 5);

  return {
    categoryId: cat?.id ?? null,
    categorySlug: cat?.slug ?? parsed.categorySlug ?? null,
    tagIds: unique.map((t) => t.id),
    tagSlugs: unique.map((t) => t.slug),
  };
}

function finalizeResult(
  parsed: ParsedArticle,
  input: GenerateNewsInput,
  extras: { researchNotes?: string; usedModelId?: string; mock?: boolean },
): GenerateNewsResult {
  const categories = input.categories ?? [];
  const tags = input.tags ?? [];
  const tax = resolveTaxonomy(parsed, categories, tags);
  const title = parsed.title;
  const excerpt = parsed.excerpt;
  const seoTitle =
    parsed.seoTitle ||
    (parsed.title ? `${parsed.title}`.slice(0, 60) : undefined);
  const seoDescription =
    parsed.seoDescription ||
    (parsed.excerpt ? parsed.excerpt.slice(0, 160) : undefined);
  let seoKeywords = parsed.seoKeywords;
  if ((!seoKeywords || !seoKeywords.trim()) && tax.tagSlugs?.length) {
    seoKeywords = tax.tagSlugs.join(", ");
  }
  return {
    title: input.fillTitle ? title : title,
    excerpt: input.fillExcerpt ? excerpt : excerpt,
    bodyHtml: parsed.bodyHtml,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogTitle: parsed.ogTitle || seoTitle,
    ogDescription: parsed.ogDescription || seoDescription,
    ...tax,
    researchNotes: extras.researchNotes,
    usedModelId: extras.usedModelId,
    mock: extras.mock,
  };
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
        maxTokens: 6144,
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

  const system = buildSystemPrompt({
    categories: input.categories ?? [],
    tags: input.tags ?? [],
  });
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
      return finalizeResult(parsed, input, {
        researchNotes: researchNotes || undefined,
        usedModelId,
      });
    }

    const raw = await invokeProvider(
      model.provider,
      model.id,
      apiKey,
      system,
      user,
    );
    const parsed = extractJson(raw);
    return finalizeResult(parsed, input, {
      researchNotes: researchNotes || undefined,
      usedModelId: model.id,
    });
  } catch (err) {
    if (err instanceof ProviderHttpError) throw err;
    const message = err instanceof Error ? err.message : "Generation failed";
    if (model.provider === "nvidia") {
      throw new ProviderHttpError(actionableNvidiaMessage(message, model.id), 400);
    }
    throw new Error(message);
  }
}
