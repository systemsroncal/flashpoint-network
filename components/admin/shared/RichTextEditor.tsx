"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  name: string;
  label?: string;
  initialHtml?: string | null;
  placeholder?: string;
  minHeight?: number;
  onHtmlChange?: (html: string) => void;
  /** When `forceToken` changes, replace editor content with `forceHtml`. */
  forceHtml?: string | null;
  forceToken?: number;
};

function toEditorHtml(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

export default function RichTextEditor({
  name,
  label = "Content",
  initialHtml = "",
  placeholder = "Write content…",
  minHeight = 220,
  onHtmlChange,
  forceHtml,
  forceToken,
}: Props) {
  const seed = toEditorHtml(initialHtml);
  const [html, setHtml] = useState(seed || "<p></p>");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rich-image",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: seed || "",
    onUpdate: ({ editor: ed }) => {
      const next = ed.getHTML();
      setHtml(next);
      onHtmlChange?.(next);
    },
    editorProps: {
      attributes: {
        class: "fpn-rich-editor",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = seed || "";
    const current = editor.getHTML();
    if (next && next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
      setHtml(next);
      onHtmlChange?.(next);
    }
    // intentionally omit onHtmlChange — parent may pass unstable callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, seed]);

  useEffect(() => {
    if (!editor || forceToken == null || forceToken <= 0) return;
    const next = toEditorHtml(forceHtml) || "<p></p>";
    editor.commands.setContent(next, { emitUpdate: true });
    setHtml(next);
    onHtmlChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, forceToken]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif,image/avif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: fd,
          credentials: "same-origin",
        });
        const result = (await res.json()) as
          | { ok: true; url: string; absoluteUrl?: string }
          | { ok: false; error: string };
        if (!result.ok) {
          window.alert(result.error || "Upload failed");
          return;
        }
        const src = result.absoluteUrl || result.url;
        editor.chain().focus().setImage({ src }).run();
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Upload failed");
      }
    };
    input.click();
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor}
              sx={{ fontWeight: 700 }}
            >
              B
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor}
              sx={{ fontStyle: "italic" }}
            >
              I
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={!editor}
              sx={{ textDecoration: "line-through" }}
            >
              S
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editor}
              sx={{ textDecoration: "underline" }}
            >
              U
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              disabled={!editor}
            >
              H2
            </Button>
            <Button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              disabled={!editor}
            >
              H3
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor}
            >
              • List
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={!editor}
            >
              1. List
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              disabled={!editor}
            >
              Quote
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button type="button" onClick={setLink} disabled={!editor}>
              Link
            </Button>
            <Button type="button" onClick={addImage} disabled={!editor}>
              Image
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor}
            >
              Undo
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor}
            >
              Redo
            </Button>
          </ButtonGroup>
        </Stack>

        <Box
          sx={{
            minHeight,
            px: 2,
            py: 1.5,
            "& .fpn-rich-editor": {
              minHeight: minHeight - 24,
              outline: "none",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "1rem",
              lineHeight: 1.7,
            },
            "& .fpn-rich-editor p": { margin: "0 0 0.85rem" },
            "& .fpn-rich-editor h2": {
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "1rem 0 0.6rem",
            },
            "& .fpn-rich-editor h3": {
              fontSize: "1.2rem",
              fontWeight: 700,
              margin: "0.9rem 0 0.5rem",
            },
            "& .fpn-rich-editor ul, & .fpn-rich-editor ol": {
              paddingLeft: "1.4rem",
              marginBottom: "0.85rem",
            },
            "& .fpn-rich-editor blockquote": {
              borderLeft: "3px solid #E85D04",
              margin: "0 0 0.85rem",
              paddingLeft: "0.9rem",
              color: "#4B5563",
            },
            "& .fpn-rich-editor a": {
              color: "#E85D04",
              textDecoration: "underline",
            },
            "& .fpn-rich-editor img, & .fpn-rich-editor .rich-image": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 4,
              margin: "0.75rem 0",
            },
            "& .ProseMirror p.is-editor-empty:first-of-type::before": {
              color: "#9CA3AF",
              content: "attr(data-placeholder)",
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
      <input type="hidden" name={name} value={html} readOnly />
    </Box>
  );
}
