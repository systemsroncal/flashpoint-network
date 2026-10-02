import "server-only";

import { findAiModel, type AiProviderKeys } from "@/lib/ai/catalog";
import {
  generateNewsArticle,
  type GenerateNewsResult,
} from "@/lib/ai/generate";

export type PageSeoSuggestInput = {
  pageLabel: string;
  path: string;
  defaultTitle: string;
  defaultDescription: string;
  modelId: string;
  keys: AiProviderKeys;
};

export type PageSeoSuggestResult = {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  mock?: boolean;
};

function mockPageSeo(input: PageSeoSuggestInput): PageSeoSuggestResult {
  const title = `${input.defaultTitle} | FlashPoint Television Network`.slice(
    0,
    60,
  );
  const desc = (
    input.defaultDescription ||
    `Learn more on FlashPoint Television Network — ${input.pageLabel}.`
  ).slice(0, 160);
  const keywords = [
    "FlashPoint",
    input.pageLabel.split(/\s+/)[0] || "FPTN",
    "television network",
  ].join(", ");
  return {
    seo_title: title,
    seo_description: desc,
    seo_keywords: keywords,
    og_title: input.defaultTitle.slice(0, 70),
    og_description: desc,
    mock: true,
  };
}

export async function suggestPublicPageSeo(
  input: PageSeoSuggestInput,
): Promise<PageSeoSuggestResult> {
  const prompt = [
    `Public site page: "${input.pageLabel}"`,
    `URL path: ${input.path}`,
    `Default title: ${input.defaultTitle}`,
    `Default description: ${input.defaultDescription}`,
    "",
    "Write SEO meta for this static page only (not a news article).",
  ].join("\n");

  const article: GenerateNewsResult = await generateNewsArticle({
    prompt,
    modelId: input.modelId,
    keys: input.keys,
    fillTitle: false,
    fillExcerpt: false,
    categories: [],
    tags: [],
  });

  if (article.mock) {
    return mockPageSeo(input);
  }

  const seoTitle = (
    article.seoTitle ||
    article.ogTitle ||
    input.defaultTitle
  ).slice(0, 70);
  const seoDescription = (
    article.seoDescription ||
    article.ogDescription ||
    input.defaultDescription
  ).slice(0, 320);
  const keywords =
    article.seoKeywords ||
    [input.pageLabel, "FlashPoint Television Network"].join(", ");

  return {
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: keywords,
    og_title: (article.ogTitle || seoTitle).slice(0, 70),
    og_description: (article.ogDescription || seoDescription).slice(0, 320),
    mock: article.mock,
  };
}

export function defaultPageSeoModelId(keys: AiProviderKeys): string {
  if (keys.nvidia?.trim()) {
    const m = findAiModel("nvidia/llama-3.1-nemotron-nano-8b-v1");
    return m?.id ?? "nvidia/llama-3.1-nemotron-nano-8b-v1";
  }
  return "nvidia/llama-3.1-nemotron-nano-8b-v1";
}
