"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { saveMinistryProgramsSortAction } from "@/lib/admin/actions";
import type {
  MinistryProgram,
  MinistryProgramsSortMode,
} from "@/lib/types/cms";

const SORT_OPTIONS: { value: MinistryProgramsSortMode; label: string }[] = [
  { value: "manual", label: "Manual (sort order)" },
  { value: "a_z", label: "A → Z" },
  { value: "z_a", label: "Z → A" },
  { value: "newest", label: "Newest first" },
  { value: "random", label: "Random" },
];

export default function MinistryProgramsTable({
  programs,
  sortMode,
}: {
  programs: MinistryProgram[];
  sortMode: MinistryProgramsSortMode;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onExport = async () => {
    setBusy("export");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/network-programs/export");
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Export failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="([^"]+)"/)?.[1] || "network-programs.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Excel exported.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(null);
    }
  };

  const onImportFile = async (file: File) => {
    setBusy("import");
    setError(null);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/network-programs/import", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        created?: number;
        updated?: number;
        error?: string;
        errors?: string[];
      };
      if (!res.ok || json.error) {
        throw new Error(json.error || "Import failed.");
      }
      const parts = [
        `Created ${json.created ?? 0}`,
        `updated ${json.updated ?? 0}`,
      ];
      if (json.errors?.length) {
        parts.push(`${json.errors.length} row error(s)`);
        setError(json.errors.slice(0, 5).join(" · "));
      }
      setMessage(`${parts.join(", ")}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardCard
        title="Public grid sort"
        subtitle="Controls ordering on /network-programs"
      >
        <Stack
          component="form"
          action={saveMinistryProgramsSortAction}
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <TextField
            select
            name="sort_mode"
            label="Sort mode"
            defaultValue={sortMode}
            sx={{ minWidth: 240 }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained">
            Save sort
          </Button>
          <Button
            component={Link}
            href="/network-programs"
            target="_blank"
            variant="outlined"
          >
            View public page
          </Button>
        </Stack>
      </DashboardCard>

      <DashboardCard
        title="Network Programs"
        subtitle={`${programs.length} total`}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              disabled={busy !== null}
              onClick={() => void onExport()}
            >
              {busy === "export" ? "Exporting…" : "Export Excel"}
            </Button>
            <Button
              variant="outlined"
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
            >
              {busy === "import" ? "Importing…" : "Import Excel"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onImportFile(file);
              }}
            />
            <Button
              component={Link}
              href="/admin/network-programs/new"
              variant="contained"
            >
              New program
            </Button>
          </Stack>
        }
      >
        {message ? (
          <Typography variant="body2" color="success.main" sx={{ mb: 1.5 }}>
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
            {error}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Excel columns: id, title, host_name, schedule_detail, featured_image_url,
          sort_order, status. Blank id creates a new row; existing id updates.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id} hover>
                <TableCell>{program.sort_order}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{program.title}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {program.host_name || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ whiteSpace: "pre-line" }}
                  >
                    {program.schedule_detail ||
                      program.schedule_note ||
                      "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={program.status}
                    color={
                      program.status === "published" ? "success" : "default"
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    component={Link}
                    href={`/admin/network-programs/${program.id}`}
                    size="small"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    No network programs yet. Create one or import Excel.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </DashboardCard>
    </Stack>
  );
}
