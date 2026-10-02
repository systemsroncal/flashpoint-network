import { Node, mergeAttributes } from "@tiptap/core";
import { decodeEmbedRaw, encodeEmbedRaw } from "@/lib/editor/html-embed";

export const HtmlEmbed = Node.create({
  name: "htmlEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      raw: {
        default: "",
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
          return {
            raw: encoded ? decodeEmbedRaw(encoded) : "",
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-fpn-html-embed": "1",
        class: "fpn-html-embed-slot",
        "data-raw": encodeEmbedRaw(String(node.attrs.raw || "")),
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const wrap = document.createElement("div");
      wrap.className = "fpn-html-embed-slot";
      wrap.setAttribute("data-fpn-html-embed", "1");

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
