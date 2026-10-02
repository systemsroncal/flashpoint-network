"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import HtmlEmbedDialog from "@/components/admin/shared/HtmlEmbedDialog";
import { HtmlEmbed } from "@/lib/editor/html-embed-extension";
import {
  prepareHtmlForEditorStorage,
  prepareHtmlForHtmlTabDisplay,
} from "@/lib/editor/html-embed";
import { createPasteMarkdownExtension } from "@/lib/editor/paste-markdown-extension";
import {
  insertIntoHtmlSource,
  readClipboardPayload,
  resolveClipboardPaste,
} from "@/lib/editor/clipboard-paste";
import { setHtmlSourcePasteHandler } from "@/lib/editor/clipboard-paste-handlers";
import { normalizePastedHtml } from "@/lib/editor/paste-markdown";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  name: string;
  label?: string;
  initialHtml?: string | null;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onHtmlChange?: (html: string) => void;
  forceHtml?: string | null;
  forceToken?: number;
};

type EditorMode = "visual" | "html";

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
  maxHeight = 480,
  onHtmlChange,
  forceHtml,
  forceToken,
}: Props) {
  const seed = prepareHtmlForEditorStorage(toEditorHtml(initialHtml));
  const [html, setHtml] = useState(seed || "<p></p>");
  const [htmlSource, setHtmlSource] = useState(
    prepareHtmlForHtmlTabDisplay(seed) || seed || "<p></p>",
  );
  const [mode, setMode] = useState<EditorMode>("visual");
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  const syncStoredBody = useCallback(
    (source: string) => {
      const stored = prepareHtmlForEditorStorage(source);
      setHtml(stored);
      onHtmlChange?.(stored);
      return stored;
    },
    [onHtmlChange],
  );

  const insertHtmlSourceAtCursor = useCallback(
    (source: string) => {
      setMode("html");
      const ta = htmlTextareaRef.current;
      setHtmlSource((prev) => {
        let next: string;
        if (ta) {
          const { next: merged, cursor } = insertIntoHtmlSource(
            prev,
            source,
            ta.selectionStart,
            ta.selectionEnd,
          );
          next = merged;
          window.setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(cursor, cursor);
          }, 0);
        } else {
          next = prev.trim() ? `${prev}\n\n${source}` : source;
        }
        syncStoredBody(next);
        return next;
      });
    },
    [syncStoredBody],
  );

  useEffect(() => {
    setHtmlSourcePasteHandler(insertHtmlSourceAtCursor);
    return () => setHtmlSourcePasteHandler(null);
  }, [insertHtmlSourceAtCursor]);

  const extensions = useMemo(
    () => [
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
      HtmlEmbed,
      createPasteMarkdownExtension(),
    ],
    [placeholder],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: seed || "",
    onUpdate: ({ editor: ed }) => {
      syncStoredBody(ed.getHTML());
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
      window.setTimeout(() => {
        syncStoredBody(next);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, seed]);

  useEffect(() => {
    if (!editor || forceToken == null || forceToken <= 0) return;
    const next = prepareHtmlForEditorStorage(toEditorHtml(forceHtml) || "<p></p>");
    editor.commands.setContent(next, { emitUpdate: true });
    window.setTimeout(() => {
      syncStoredBody(editor.getHTML());
      setHtmlSource(prepareHtmlForHtmlTabDisplay(editor.getHTML()));
      setMode("visual");
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, forceToken]);

  const switchToVisual = () => {
    if (!editor) return;
    const stored = prepareHtmlForEditorStorage(htmlSource);
    editor.commands.setContent(stored || "<p></p>", { emitUpdate: false });
    const fromEditor = syncStoredBody(editor.getHTML());
    setHtmlSource(prepareHtmlForHtmlTabDisplay(fromEditor));
    setMode("visual");
  };

  const switchToHtml = () => {
    if (editor) {
      const stored = syncStoredBody(editor.getHTML());
      setHtmlSource(prepareHtmlForHtmlTabDisplay(stored));
    } else {
      setHtmlSource(prepareHtmlForHtmlTabDisplay(html));
    }
    setMode("html");
    window.setTimeout(() => htmlTextareaRef.current?.focus(), 0);
  };

  const runSmartPaste = async () => {
    const payload = await readClipboardPayload();
    if (!payload.plain.trim() && !payload.html.trim()) {
      window.alert("No hay contenido en el portapapeles.");
      return;
    }

    const action = resolveClipboardPaste(payload);

    if (action.type === "html-source") {
      insertHtmlSourceAtCursor(action.source);
      return;
    }

    const visualHtml = normalizePastedHtml(action.html);

    if (mode === "html") {
      setMode("visual");
      window.setTimeout(() => {
        editor?.chain().focus().insertContent(visualHtml).run();
      }, 0);
      return;
    }

    editor?.chain().focus().insertContent(visualHtml).run();
  };

  const setLink = () => {
    if (!editor || mode !== "visual") return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const applyHtmlEmbed = (snippet: string) => {
    const raw = snippet.trim();
    if (!raw) return;
    if (mode === "html") {
      insertHtmlSourceAtCursor(raw);
      return;
    }
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "htmlEmbed",
        attrs: { raw },
      })
      .run();
  };

  const addImage = async () => {
    if (!editor || mode !== "visual") return;
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

  const toolbarDisabled = !editor || mode === "html";

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
          maxHeight,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
            flexWrap: "wrap",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              variant={mode === "visual" ? "contained" : "outlined"}
              onClick={switchToVisual}
            >
              Visual
            </Button>
            <Button
              type="button"
              variant={mode === "html" ? "contained" : "outlined"}
              onClick={switchToHtml}
            >
              HTML
            </Button>
          </ButtonGroup>
          <Button
            type="button"
            size="small"
            variant="outlined"
            onClick={() => void runSmartPaste()}
          >
            Paste
          </Button>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={toolbarDisabled}
              sx={{ fontWeight: 700 }}
            >
              B
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={toolbarDisabled}
              sx={{ fontStyle: "italic" }}
            >
              I
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={toolbarDisabled}
              sx={{ textDecoration: "line-through" }}
            >
              S
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={toolbarDisabled}
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
              disabled={toolbarDisabled}
            >
              H2
            </Button>
            <Button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              disabled={toolbarDisabled}
            >
              H3
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={toolbarDisabled}
            >
              • List
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={toolbarDisabled}
            >
              1. List
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              disabled={toolbarDisabled}
            >
              Quote
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button type="button" onClick={setLink} disabled={toolbarDisabled}>
              Link
            </Button>
            <Button type="button" onClick={addImage} disabled={toolbarDisabled}>
              Image
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEmbedDialogOpen(true);
              }}
              disabled={mode === "visual" && !editor}
            >
              Embed
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup size="small" variant="outlined">
            <Button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={toolbarDisabled}
            >
              Undo
            </Button>
            <Button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={toolbarDisabled}
            >
              Redo
            </Button>
          </ButtonGroup>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: mode === "html" ? 0 : 2,
            py: mode === "html" ? 0 : 1.5,
            display: mode === "html" ? "flex" : "block",
            flexDirection: "column",
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
            "& .fpn-html-embed-slot": {
              my: 2,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
              bgcolor: "grey.50",
            },
            "& .fpn-html-embed-label": {
              m: 0,
              mb: 1,
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "text.secondary",
            },
            "& .fpn-html-embed-preview": {
              maxWidth: "100%",
              overflow: "auto",
              fontSize: "0.8125rem",
            },
          }}
        >
          {mode === "html" ? (
            <TextField
              inputRef={htmlTextareaRef}
              multiline
              fullWidth
              minRows={12}
              value={htmlSource}
              onChange={(e) => {
                const value = e.target.value;
                setHtmlSource(value);
                syncStoredBody(value);
              }}
              placeholder="<p>HTML del artículo…</p>"
              spellCheck={false}
              sx={{
                flex: 1,
                "& .MuiInputBase-root": {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: "0.8125rem",
                  lineHeight: 1.55,
                  alignItems: "flex-start",
                  minHeight: minHeight,
                  borderRadius: 0,
                },
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& textarea": { minHeight: `${minHeight}px` },
              }}
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </Box>
      </Box>
      <input type="hidden" name={name} value={html} readOnly />
      <HtmlEmbedDialog
        open={embedDialogOpen}
        onClose={() => setEmbedDialogOpen(false)}
        onSubmit={applyHtmlEmbed}
      />
    </Box>
  );
}
