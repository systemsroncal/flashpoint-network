"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  IconCalendarEvent,
  IconCategory,
  IconEye,
  IconNews,
} from "@tabler/icons-react";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import PageContainer from "@/components/admin/shared/PageContainer";
import type { Post } from "@/lib/types/cms";

type Stats = {
  posts: number;
  published: number;
  events: number;
  categories: number;
  tags: number;
  users: number;
  totalViews: number;
};

export default function AdminDashboard({
  stats,
  recent,
}: {
  stats: Stats;
  recent: Post[];
}) {
  const cards = [
    {
      title: "Published news",
      value: String(stats.published),
      hint: `${stats.posts} total news`,
      icon: IconNews,
      color: "primary.main",
    },
    {
      title: "Events",
      value: String(stats.events),
      hint: "Live + scheduled",
      icon: IconCalendarEvent,
      color: "secondary.main",
    },
    {
      title: "Categories",
      value: String(stats.categories),
      hint: `${stats.tags} tags`,
      icon: IconCategory,
      color: "success.main",
    },
    {
      title: "Total views",
      value: String(stats.totalViews),
      hint: `${stats.users} profiles`,
      icon: IconEye,
      color: "warning.main",
    },
  ];

  return (
    <PageContainer
      title="FP Network Admin"
      description="Flash Point Network editorial dashboard"
    >
      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          mb={3}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" mb={0.5}>
              Dashboard
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Manage the same news that power the public home.
            </Typography>
          </Box>
          <Button component={Link} href="/admin/posts/new" variant="contained">
            New news
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {cards.map((stat) => {
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
              title="Recent news"
              subtitle="Click Edit to change home content"
              action={
                <Button component={Link} href="/admin/posts" size="small">
                  View all
                </Button>
              }
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map((post) => (
                    <TableRow key={post.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{post.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {post.category?.name ?? "Uncategorized"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={post.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          href={`/admin/posts/${post.id}`}
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
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardCard title="Quick links">
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  Public home: <strong>/</strong>
                </Typography>
                <Typography variant="body2">
                  News: <strong>/admin/posts</strong>
                </Typography>
                <Typography variant="body2">
                  Events: <strong>/admin/events</strong>
                </Typography>
                <Typography variant="body2">
                  Categories: <strong>/admin/categories</strong>
                </Typography>
                <Button component={Link} href="/" target="_blank" variant="outlined">
                  Open public site
                </Button>
              </Stack>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
