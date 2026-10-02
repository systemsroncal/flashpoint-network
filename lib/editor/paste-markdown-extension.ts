import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  markdownPlainToHtml,
  normalizePastedHtml,
  shouldPastePlainAsMarkdown,
} from "@/lib/editor/paste-markdown";

/**
 * Improves paste from ChatGPT mobile (plain markdown) and normalizes HTML paste.
 */
export const PasteMarkdown = Extension.create({
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

            if (shouldPastePlainAsMarkdown(html, plain)) {
              event.preventDefault();
              const content = markdownPlainToHtml(plain);
              editor.chain().focus().insertContent(content).run();
              return true;
            }

            return false;
          },
          transformPastedHTML(html) {
            return normalizePastedHtml(html);
          },
        },
      }),
    ];
  },
});
