"use client";

import Link from "next/link";
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { formatDateTime } from "@/lib/format";
import type { HelpCenterSubmission } from "@/lib/types/cms";

export default function HelpCenterSubmissionsTable({
  submissions,
}: {
  submissions: HelpCenterSubmission[];
}) {
  const timeZone = useTimezone();
  const unread = submissions.filter((s) => !s.read_at).length;

  return (
    <DashboardCard
      title="Help Center requests"
      subtitle={`${submissions.length} entries${unread ? ` · ${unread} unread` : ""}`}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Area</TableCell>
            <TableCell>Received</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography variant="subtitle2">{row.subject}</Typography>
                {!row.read_at ? (
                  <Chip size="small" color="primary" label="New" sx={{ mt: 0.5 }} />
                ) : null}
              </TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>
                <Typography variant="body2">{row.help_area}</Typography>
              </TableCell>
              <TableCell>
                {formatDateTime(row.created_at, timeZone)}
              </TableCell>
              <TableCell align="right">
                <Button
                  component={Link}
                  href={`/admin/help-center/${row.id}`}
                  size="small"
                  variant="outlined"
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="textSecondary" sx={{ py: 2 }}>
                  No Help Center submissions yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
