"use client";

import { useEffect, useRef } from "react";

export type TrustedHtmlPlacement = "head" | "body" | "footer";

type Props = {
  /** Raw HTML from Admin → Settings. Trusted admin-only content. */
  html: string;
  placement: TrustedHtmlPlacement;
};

/**
 * Injects trusted admin HTML (including script tags) into the public page.
 *
 * React's dangerouslySetInnerHTML does not execute scripts; this component
 * clones nodes into the real DOM so third-party tags (GA, Meta Pixel, etc.) run.
 *
 * Security: only admins can edit these fields. Treat contents as fully trusted.
 */
export default function TrustedHtmlInject({ html, placement }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const source = (html ?? "").trim();
    if (!source) return;

    const template = document.createElement("template");
    template.innerHTML = source;

    const mounted: Node[] = [];

    const mountTarget =
      placement === "head"
        ? document.head
        : containerRef.current ?? document.body;

    if (!mountTarget) return;

    const appendExecutable = (parent: ParentNode, node: ChildNode) => {
      if (node.nodeName === "SCRIPT") {
        const orig = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attr of Array.from(orig.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        if (orig.textContent) script.text = orig.textContent;
        parent.appendChild(script);
        mounted.push(script);
        return;
      }
      const clone = node.cloneNode(true);
      parent.appendChild(clone);
      mounted.push(clone);
    };

    Array.from(template.content.childNodes).forEach((node) => {
      appendExecutable(mountTarget, node);
    });

    return () => {
      for (const node of mounted) {
        node.parentNode?.removeChild(node);
      }
    };
  }, [html, placement]);

  if (placement === "head") return null;

  return (
    <div
      ref={containerRef}
      data-fpn-html-inject={placement}
      suppressHydrationWarning
    />
  );
}
