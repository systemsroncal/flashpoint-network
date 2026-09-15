"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type ModelOption = {
  id: string;
  label: string;
  provider: string;
  enabled: boolean;
  disabledReason: string | null;
  webGrounded?: boolean;
};

type Props = {
  titleBlank: boolean;
  excerptBlank: boolean;
  onGenerated: (result: {
    title?: string;
    excerpt?: string;
    bodyHtml: string;
  }) => void;
};

export default function AiWritingAssistant({
  titleBlank,
  excerptBlank,
  onGenerated,
}: Props) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const loadModels = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/ai/models", { cache: "no-store" });
      const data = (await res.json()) as {
        models?: ModelOption[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to load models");
      const list = data.models || [];
      setModels(list);
      const firstEnabled = list.find((m) => m.enabled);
      setModelId((prev) => prev || firstEnabled?.id || list[0]?.id || "");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load models");
    }
  }, []);

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  const enabledCount = useMemo(
    () => models.filter((m) => m.enabled).length,
    [models],
  );

  const onGenerate = async () => {
    setError(null);
    setOkMsg(null);
    if (!prompt.trim()) {
      setError("Enter a writing instruction / prompt.");
      return;
    }
    const selected = models.find((m) => m.id === modelId);
    if (!selected?.enabled) {
      setError(
        selected?.disabledReason ||
          "Configure an API key in Settings for this provider.",
      );
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelId,
          fillTitle: titleBlank,
          fillExcerpt: excerptBlank,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        title?: string | null;
        excerpt?: string | null;
        bodyHtml?: string;
      };
      if (!res.ok || !data.bodyHtml) {
        throw new Error(data.error || "Generation failed");
      }
      onGenerated({
        title: data.title || undefined,
        excerpt: data.excerpt || undefined,
        bodyHtml: data.bodyHtml,
      });
      setOkMsg("Draft inserted into the body editor.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
        bgcolor: "grey.50",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        AI writing assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Generate a TipTap-ready news draft. Body is always replaced. Title and
        excerpt fill only when those fields are currently empty.
      </Typography>

      {loadError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {loadError}{" "}
          <Button size="small" onClick={() => void loadModels()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {enabledCount === 0 && !loadError ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No provider keys configured yet. Add keys in{" "}
          <strong>Settings → AI provider API keys</strong>. You can still compose
          prompts here; Generate will explain what&apos;s missing.
        </Alert>
      ) : null}

      <Stack spacing={2}>
        <TextField
          label="Prompt / instruction"
          placeholder="Generate a news article about the Army secretary resignation and Capitol reactions…"
          fullWidth
          multiline
          minRows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel id="ai-model-label">Model</InputLabel>
          <Select
            labelId="ai-model-label"
            label="Model"
            value={modelId}
            onChange={(e) => setModelId(String(e.target.value))}
          >
            {models.map((m) => (
              <MenuItem key={m.id} value={m.id} disabled={!m.enabled}>
                {m.label} · {m.provider}
                {!m.enabled
                  ? " — Configure API key in Settings"
                  : m.webGrounded
                    ? " (web-grounded)"
                    : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {okMsg ? <Alert severity="success">{okMsg}</Alert> : null}

        <Button
          variant="contained"
          onClick={() => void onGenerate()}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ alignSelf: "flex-start" }}
        >
          {busy ? "Generating…" : "Generate draft"}
        </Button>
      </Stack>
    </Box>
  );
}
