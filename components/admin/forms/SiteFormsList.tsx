"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import type { SiteFormDefinition } from "@/lib/admin/site-forms";

type Props = {
  forms: SiteFormDefinition[];
  counts: Record<string, number>;
};

export default function SiteFormsList({ forms, counts }: Props) {
  const router = useRouter();
  return (
    <Stack spacing={2}>
      {forms.map((form) => {
        const count = counts[form.id] ?? 0;
        return (
          <Card key={form.id} variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h6">{form.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {form.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Public page:{" "}
                    <Link href={form.publicPath} target="_blank" rel="noopener noreferrer">
                      {form.publicPath}
                    </Link>
                    {" · "}
                    {count} {count === 1 ? "entry" : "entries"}
                  </Typography>
                </Box>
                <Button
                  type="button"
                  variant="contained"
                  sx={{ flexShrink: 0 }}
                  onClick={() => router.push(form.adminEntriesPath)}
                >
                  View entries
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
