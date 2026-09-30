"use client";

import Link from "next/link";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { formatDateTime } from "@/lib/format";
import type { AdvertiseInquiry } from "@/lib/types/cms";

export default function AdvertiseInquiryDetail({
  inquiry,
}: {
  inquiry: AdvertiseInquiry;
}) {
  const timeZone = useTimezone();

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        href="/admin/forms/advertise"
        variant="text"
        sx={{ alignSelf: "flex-start" }}
      >
        ← All entries
      </Button>

      <DashboardCard
        title={inquiry.name}
        subtitle={formatDateTime(inquiry.created_at, timeZone)}
        action={
          !inquiry.read_at ? (
            <Chip size="small" color="primary" label="Unread" />
          ) : (
            <Chip size="small" label="Read" variant="outlined" />
          )
        }
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography>
              <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
            </Typography>
          </Box>
          {inquiry.company ? (
            <Box>
              <Typography variant="caption" color="text.secondary">Company</Typography>
              <Typography>{inquiry.company}</Typography>
            </Box>
          ) : null}
          {inquiry.phone ? (
            <Box>
              <Typography variant="caption" color="text.secondary">Phone</Typography>
              <Typography>{inquiry.phone}</Typography>
            </Box>
          ) : null}
          <Box>
            <Typography variant="caption" color="text.secondary">Message</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{inquiry.message}</Typography>
          </Box>
        </Stack>
      </DashboardCard>
    </Stack>
  );
}
