"use client";

import Link from "next/link";
import { Alert, Button, Stack } from "@mui/material";

type Props = {
  backHref: string;
  backLabel?: string;
  schemaWarning?: string | null;
};

export default function FormEntriesPageChrome({
  backHref,
  backLabel = "← All forms",
  schemaWarning,
}: Props) {
  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Button
        component={Link}
        href={backHref}
        variant="text"
        sx={{ alignSelf: "flex-start" }}
      >
        {backLabel}
      </Button>
      {schemaWarning ? <Alert severity="warning">{schemaWarning}</Alert> : null}
    </Stack>
  );
}
