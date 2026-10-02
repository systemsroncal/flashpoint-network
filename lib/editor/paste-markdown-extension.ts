import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  isHtmlSourceCode,
  resolveClipboardPaste,
} from "@/lib/editor/clipboard-paste";
import { invokeHtmlSourcePaste } from "@/lib/editor/clipboard-paste-handlers";
import {
  normalizePastedHtml,
  shouldPastePlainAsMarkdown,
} from "@/lib/editor/paste-markdown";

export function createPasteMarkdownExtension() {
  return Extension.create({
    name: "pasteMarkdown",

    addProseMirrorPlugins() {
      const editor = this.editor;

      return [
        new Plugin({
          key: new PluginKey("pasteMarkdown"),
          props: {
            handlePaste(_view, event) {
              const dt = event.clipboardData;
              if (!dt) return false;

              const plain = dt.getData("text/plain");
              const html = dt.getData("text/html");

              if (plain.trim() && isHtmlSourceCode(plain.trim())) {
                event.preventDefault();
                invokeHtmlSourcePaste(plain.trim());
                return true;
              }

              const action = resolveClipboardPaste({ html, plain });
              if (action.type === "html-source") {
                event.preventDefault();
                invokeHtmlSourcePaste(action.source);
                return true;
              }

              const needsCustom =
                shouldPastePlainAsMarkdown(html, plain) ||
                (!html.trim() && Boolean(plain.trim()));

              if (!needsCustom) return false;

              event.preventDefault();
              editor
                .chain()
                .focus()
                .insertContent(normalizePastedHtml(action.html))
                .run();
              return true;
            },
            transformPastedHTML(html) {
              return normalizePastedHtml(html);
            },
          },
        }),
      ];
    },
  });
}
