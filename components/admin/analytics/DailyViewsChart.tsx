"use client";

import dynamic from "next/dynamic";
import { Box, Skeleton } from "@mui/material";
import type { ApexOptions } from "apexcharts";
import type { DailyViewsPoint } from "@/lib/admin/analytics";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={280} />,
});

const FPN_NAVY = "#1B2A64";
const FPN_ORANGE = "#FF490D";

export default function DailyViewsChart({
  daily,
}: {
  daily: DailyViewsPoint[];
}) {
  const hasData = daily.some((d) => d.views > 0);
  const categories = daily.map((d) => d.label);
  const series = [{ name: "Views", data: daily.map((d) => d.views) }];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      foreColor: "#5A6A85",
    },
    colors: [FPN_NAVY],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: daily.length > 20 ? "55%" : "45%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#EAEFF4",
      strokeDashArray: 3,
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: { fontSize: "11px" },
      },
      tickAmount: Math.min(6, categories.length),
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (v) =>
          Number.isInteger(v) ? String(v) : Number(v).toFixed(0),
      },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (v) => `${v} views` },
    },
    fill: {
      type: "solid",
      opacity: 1,
    },
    states: {
      hover: {
        filter: { type: "darken" },
      },
    },
  };

  if (!hasData) {
    return (
      <Box
        sx={{
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "#F8FAFC",
        }}
      >
        No data to report for this range.
      </Box>
    );
  }

  return (
    <Box sx={{ "& .apexcharts-bar-area:hover": { fill: FPN_ORANGE } }}>
      <Chart options={options} series={series} type="bar" height={300} />
    </Box>
  );
}
