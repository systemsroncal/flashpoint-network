"use client";

import { useRouter } from "next/navigation";
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
import type { AdvertiseInquiry } from "@/lib/types/cms";

export default function AdvertiseInquiriesTable({
  inquiries,
}: {
  inquiries: AdvertiseInquiry[];
}) {
  const router = useRouter();
  const timeZone = useTimezone();
  const unread = inquiries.filter((s) => !s.read_at).length;

  return (
    <DashboardCard
      title="Advertising inquiries"
      subtitle={`${inquiries.length} entries${unread ? ` · ${unread} unread` : ""}`}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Received</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inquiries.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => router.push(`/admin/forms/advertise/${row.id}`)}
            >
              <TableCell>
                <Typography variant="subtitle2">{row.name}</Typography>
                {!row.read_at ? (
                  <Chip size="small" color="primary" label="New" sx={{ mt: 0.5 }} />
                ) : null}
              </TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.company || "—"}</TableCell>
              <TableCell>{formatDateTime(row.created_at, timeZone)}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/forms/advertise/${row.id}`);
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {inquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="textSecondary" sx={{ py: 2 }}>
                  No advertising inquiries yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
