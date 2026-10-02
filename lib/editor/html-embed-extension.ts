import { Node, mergeAttributes } from "@tiptap/core";
import {
  decodeEmbedRaw,
  decodeHtmlEntities,
  encodeEmbedRaw,
} from "@/lib/editor/html-embed";

export const HtmlEmbed = Node.create({
  name: "htmlEmbed",
  group: "block",
  atom: true,
  draggable: true,
  priority: 1000,

  addAttributes() {
    return {
      raw: {
        default: "",
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-fpn-html-embed="1"]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const encoded = el.getAttribute("data-raw");
          if (encoded) {
            return { raw: decodeEmbedRaw(encoded) };
          }
          const legacy = el.getAttribute("raw");
          if (legacy) {
            return { raw: decodeHtmlEntities(legacy) };
          }
          const preview = el.querySelector(".fpn-html-embed-preview");
          if (preview?.innerHTML.trim()) {
            return { raw: preview.innerHTML.trim() };
          }
          return { raw: "" };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = { ...HTMLAttributes } as Record<string, unknown>;
    delete attrs.raw;

    return [
      "div",
      mergeAttributes(attrs, {
        "data-fpn-html-embed": "1",
        class: "fpn-html-embed-slot",
        "data-raw": encodeEmbedRaw(String(node.attrs.raw || "")),
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const wrap = document.createElement("div");
      wrap.className = "fpn-html-embed-slot fpn-html-embed-slot--editor";
      wrap.setAttribute("data-fpn-html-embed", "1");
      wrap.contentEditable = "false";

      const label = document.createElement("p");
      label.className = "fpn-html-embed-label";
      label.textContent = "HTML embed (X / Twitter, etc.)";

      const preview = document.createElement("div");
      preview.className = "fpn-html-embed-preview";
      preview.innerHTML = String(node.attrs.raw || "");

      wrap.appendChild(label);
      wrap.appendChild(preview);

      return { dom: wrap };
    };
  },
});
