"use client";

import Link from "next/link";
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
  return (
    <Stack spacing={3}>
      <DashboardCard
        title="Public grid sort"
        subtitle="Controls ordering on /ministry-programs"
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
            href="/ministry-programs"
            target="_blank"
            variant="outlined"
          >
            View public page
          </Button>
        </Stack>
      </DashboardCard>

      <DashboardCard
        title="Ministry Programs"
        subtitle={`${programs.length} total · seeded from fptn.com/ministry-programs`}
        action={
          <Button
            component={Link}
            href="/admin/ministry-programs/new"
            variant="contained"
          >
            New program
          </Button>
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Title</TableCell>
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
                  <Typography variant="caption" color="textSecondary">
                    /ministry-programs/{program.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {program.schedule_note || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={program.status}
                    color={program.status === "published" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    component={Link}
                    href={`/admin/ministry-programs/${program.id}`}
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
                <TableCell colSpan={5}>
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    No ministry programs yet. Run{" "}
                    <code>node scripts/scrape-ministry-programs.mjs</code> or
                    create one.
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
