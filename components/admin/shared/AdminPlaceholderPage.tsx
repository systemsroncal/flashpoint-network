"use client";

import { Typography } from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import PageContainer from "@/components/admin/shared/PageContainer";

type Props = {
  title: string;
  description?: string;
};

export default function AdminPlaceholderPage({
  title,
  description = "This section will be implemented in a later phase.",
}: Props) {
  return (
    <PageContainer title={title} description={description}>
      <DashboardCard title={title} subtitle="Coming soon">
        <Typography variant="body1" color="textSecondary">
          {description}
        </Typography>
      </DashboardCard>
    </PageContainer>
  );
}
