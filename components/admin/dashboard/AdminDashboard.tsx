"use client";

import { Box, Grid, Stack, Typography } from "@mui/material";
import {
  IconCalendarEvent,
  IconEye,
  IconNews,
  IconUsers,
} from "@tabler/icons-react";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import PageContainer from "@/components/admin/shared/PageContainer";

const stats = [
  {
    title: "Published posts",
    value: "—",
    hint: "Connect Supabase in Phase 2",
    icon: IconNews,
    color: "primary.main",
  },
  {
    title: "Active events",
    value: "—",
    hint: "Home spotlight ready later",
    icon: IconCalendarEvent,
    color: "secondary.main",
  },
  {
    title: "Subscribers",
    value: "—",
    hint: "Auth + roles upcoming",
    icon: IconUsers,
    color: "success.main",
  },
  {
    title: "Views (24h)",
    value: "—",
    hint: "Analytics stub",
    icon: IconEye,
    color: "warning.main",
  },
];

export default function AdminDashboard() {
  return (
    <PageContainer
      title="FP Network Admin"
      description="Flash Point Network editorial dashboard"
    >
      <Box>
        <Typography variant="h4" mb={1}>
          Dashboard
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" mb={3}>
          Phase 1 scaffold — Modernize admin shell for FP Network editors.
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <DashboardCard>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "8px",
                        bgcolor: "primary.light",
                        color: stat.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} stroke={1.5} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h5">{stat.value}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {stat.hint}
                      </Typography>
                    </Box>
                  </Stack>
                </DashboardCard>
              </Grid>
            );
          })}

          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardCard
              title="Editorial queue"
              subtitle="Placeholder until posts CRUD lands in Phase 4"
            >
              <Typography variant="body1" color="textSecondary">
                Draft, pending review, scheduled, and published workflows will
                appear here. For now this confirms the admin layout, sidebar,
                and theme adapted from Modernize Nextjs Free.
              </Typography>
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardCard title="Quick links" subtitle="Public + API stubs">
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  Public home: <strong>/</strong>
                </Typography>
                <Typography variant="body2">
                  Admin dashboard: <strong>/admin</strong>
                </Typography>
                <Typography variant="body2">
                  Health API: <strong>/api/health</strong>
                </Typography>
              </Stack>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
