"use client";

import Link from "next/link";
import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import type { EventItem } from "@/lib/types/cms";

export default function EventsTable({ events }: { events: EventItem[] }) {
  return (
    <DashboardCard
      title="Events"
      subtitle={`${events.length} total`}
      action={
        <Button component={Link} href="/admin/events/new" variant="contained">
          New event
        </Button>
      }
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Format</TableCell>
            <TableCell>Flags</TableCell>
            <TableCell>Starts</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} hover>
              <TableCell>
                <Typography variant="subtitle2">{event.title}</Typography>
                <Typography variant="caption" color="textSecondary">
                  /events/{event.slug}
                </Typography>
              </TableCell>
              <TableCell>{event.format}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  {event.is_live ? <Chip size="small" color="error" label="Live" /> : null}
                  {event.show_on_home ? <Chip size="small" label="Home" /> : null}
                </Stack>
              </TableCell>
              <TableCell>
                {event.starts_at ? new Date(event.starts_at).toLocaleString() : "—"}
              </TableCell>
              <TableCell align="right">
                <Button
                  component={Link}
                  href={`/admin/events/${event.id}`}
                  size="small"
                  variant="outlined"
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
