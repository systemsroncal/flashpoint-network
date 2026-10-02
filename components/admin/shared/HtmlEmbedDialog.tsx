"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (html: string) => void;
};

export default function HtmlEmbedDialog({ open, onClose, onSubmit }: Props) {
  const [value, setValue] = useState("");

  const handleInsert = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    onClose();
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Insert HTML embed</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          minRows={10}
          maxRows={18}
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste X/Twitter blockquote + script, or other embed code…"
          spellCheck={false}
          sx={{
            mt: 1,
            "& textarea": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "0.8125rem",
              lineHeight: 1.55,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button type="button" onClick={handleClose}>Cancel</Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleInsert}
          disabled={!value.trim()}
        >
          Insert embed
        </Button>
      </DialogActions>
    </Dialog>
  );
}
