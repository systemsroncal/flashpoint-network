type HtmlSourcePasteHandler = (source: string) => void;

let htmlSourcePasteHandler: HtmlSourcePasteHandler | null = null;

export function setHtmlSourcePasteHandler(
  handler: HtmlSourcePasteHandler | null,
) {
  htmlSourcePasteHandler = handler;
}

export function invokeHtmlSourcePaste(source: string) {
  htmlSourcePasteHandler?.(source);
}
