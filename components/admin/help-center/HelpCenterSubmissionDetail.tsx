"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { formatDateTime } from "@/lib/format";
import type { HelpCenterSubmission } from "@/lib/types/cms";

export default function HelpCenterSubmissionDetail({
  submission,
}: {
  submission: HelpCenterSubmission;
}) {
  const timeZone = useTimezone();

  return (
    <Stack spacing={3}>
      <Button component={Link} href="/admin/help-center" variant="text" sx={{ alignSelf: "flex-start" }}>
        ← All requests
      </Button>

      <DashboardCard
        title={submission.subject}
        subtitle={formatDateTime(submission.created_at, timeZone)}
        action={
          !submission.read_at ? (
            <Chip size="small" color="primary" label="Unread" />
          ) : (
            <Chip size="small" label="Read" variant="outlined" />
          )
        }
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Email
            </Typography>
            <Typography>
              <a href={`mailto:${submission.email}`}>{submission.email}</a>
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Help area
            </Typography>
            <Typography>{submission.help_area}</Typography>
          </Box>
          {submission.journalism_issue ? (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Journalism issue
              </Typography>
              <Typography>{submission.journalism_issue}</Typography>
            </Box>
          ) : null}
          <Box>
            <Typography variant="caption" color="textSecondary">
              Description
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {submission.description}
            </Typography>
          </Box>
          {submission.attachment_paths.length > 0 ? (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Attachments
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {submission.attachment_paths.map((path) => (
                  <Typography key={path}>
                    <a href={path} target="_blank" rel="noopener noreferrer">
                      {path.split("/").pop()}
                    </a>
                  </Typography>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </DashboardCard>
    </Stack>
  );
}
