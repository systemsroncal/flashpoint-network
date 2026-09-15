"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconChartBar,
  IconEye,
  IconNews,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import PageContainer from "@/components/admin/shared/PageContainer";
import DailyViewsChart from "@/components/admin/analytics/DailyViewsChart";
import type { AnalyticsOverview, AnalyticsRange } from "@/lib/admin/analytics";

const FPN_NAVY = "#1B2A64";
const FPN_ORANGE = "#FF490D";
const INSIGHT_BG = "#E8ECF5";

function KpiValue({
  value,
  emptyLabel = "No data to report",
}: {
  value: string | number | null;
  emptyLabel?: string;
}) {
  if (value === null || value === undefined || value === "" || value === 0) {
    return (
      <>
        <Typography variant="h4" fontWeight={700} color="text.disabled">
          --
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {emptyLabel}
        </Typography>
      </>
    );
  }
  return (
    <Typography variant="h4" fontWeight={700}>
      {typeof value === "number" ? value.toLocaleString() : value}
    </Typography>
  );
}

function PerformanceGauge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <Stack alignItems="flex-start" spacing={0.5}>
        <Typography variant="h4" fontWeight={700} color="text.disabled">
          --
        </Typography>
        <Typography variant="caption" color="text.secondary">
          No data to report
        </Typography>
      </Stack>
    );
  }

  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct * 0.5; // semicircle

  return (
    <Box sx={{ position: "relative", width: 120, height: 72, mx: "auto" }}>
      <svg width="120" height="72" viewBox="0 0 120 72" aria-hidden>
        <path
          d="M18 64 A42 42 0 0 1 102 64"
          fill="none"
          stroke="#EAEFF4"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M18 64 A42 42 0 0 1 102 64"
          fill="none"
          stroke={FPN_ORANGE}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 4,
          textAlign: "center",
          color: FPN_NAVY,
        }}
      >
        {score}
      </Typography>
    </Box>
  );
}

export default function AnalyticsDashboard({
  data,
}: {
  data: AnalyticsOverview;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = (Number(searchParams.get("range")) === 7 ? 7 : 30) as AnalyticsRange;

  const onRangeChange = (next: AnalyticsRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", String(next));
    router.push(`/admin/analytics?${params.toString()}`);
  };

  const insightParts = data.insight.highlight
    ? data.insight.text.split(data.insight.highlight)
    : [data.insight.text];

  return (
    <PageContainer description="Site performance from article views">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight={700} sx={{ color: FPN_NAVY }}>
          Here&apos;s how you&apos;re performing
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={range}
            onChange={(e) => onRangeChange(Number(e.target.value) as AnalyticsRange)}
            displayEmpty
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: INSIGHT_BG,
                  color: FPN_NAVY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconEye size={18} stroke={1.5} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Total views
                </Typography>
                <KpiValue value={data.totalViews || null} />
              </Box>
            </Stack>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: INSIGHT_BG,
                  color: FPN_NAVY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconUsers size={18} stroke={1.5} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Unique visitors
                </Typography>
                <KpiValue value={data.uniqueVisitors || null} />
              </Box>
            </Stack>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: INSIGHT_BG,
                  color: FPN_NAVY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconNews size={18} stroke={1.5} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Top post views
                </Typography>
                {data.topPost ? (
                  <>
                    <Typography variant="h4" fontWeight={700}>
                      {data.topPost.views.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      display="block"
                      title={data.topPost.title}
                    >
                      {data.topPost.title}
                    </Typography>
                  </>
                ) : (
                  <KpiValue value={null} />
                )}
              </Box>
            </Stack>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Performance score
            </Typography>
            <PerformanceGauge score={data.performanceScore} />
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ bgcolor: INSIGHT_BG, px: 3, py: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <IconSparkles size={18} color={FPN_ORANGE} stroke={1.75} />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ color: FPN_NAVY }}
                >
                  Insight
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "#2A3547", lineHeight: 1.6 }}>
                {data.insight.highlight ? (
                  <>
                    {insightParts[0]}
                    <Box
                      component="span"
                      sx={{ color: "#0B8F5A", fontWeight: 800 }}
                    >
                      {data.insight.highlight}
                    </Box>
                    {insightParts[1] ?? ""}
                  </>
                ) : (
                  data.insight.text
                )}
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              spacing={1.5}
              sx={{ px: 3, py: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                Publish fresh news to help drive traffic to your site
              </Typography>
              <Button
                component={Link}
                href="/admin/posts/new"
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#C8D0DC",
                  color: FPN_NAVY,
                  bgcolor: "white",
                  "&:hover": { borderColor: FPN_NAVY, bgcolor: INSIGHT_BG },
                }}
              >
                Start
              </Button>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DashboardCard
            title="Daily views"
            subtitle={`Article views over the last ${data.rangeDays} days`}
            action={
              <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary">
                <IconChartBar size={16} />
                <Typography variant="caption">post_views</Typography>
              </Stack>
            }
            footer={
              <Box sx={{ px: 3, pb: 2, textAlign: "right" }}>
                <Button
                  component={Link}
                  href="/admin/posts"
                  size="small"
                  sx={{ color: FPN_ORANGE, fontWeight: 600 }}
                >
                  Edit your news
                </Button>
              </Box>
            }
          >
            <DailyViewsChart daily={data.daily} />
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" fontWeight={700} mb={2} sx={{ color: FPN_NAVY }}>
            More ways to grow
          </Typography>
          <DashboardCard>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Keep Settings and News aligned
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Review maintenance mode, paywall, and AdSense settings, then
                  publish high-intent stories to lift daily views.
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    component={Link}
                    href="/admin/settings"
                    variant="outlined"
                    sx={{
                      borderColor: "#C8D0DC",
                      color: FPN_NAVY,
                      "&:hover": { borderColor: FPN_NAVY },
                    }}
                  >
                    Open Settings
                  </Button>
                  <Button
                    component={Link}
                    href="/admin/posts"
                    variant="contained"
                    sx={{
                      bgcolor: FPN_ORANGE,
                      "&:hover": { bgcolor: "#E03F0A" },
                    }}
                  >
                    Manage News
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    height: 120,
                    borderRadius: 2,
                    background: `linear-gradient(145deg, ${INSIGHT_BG} 0%, #fff 55%, #FFE8E0 100%)`,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: FPN_NAVY,
                  }}
                >
                  <IconChartBar size={48} stroke={1.25} />
                </Box>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
