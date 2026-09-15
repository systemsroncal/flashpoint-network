"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";

type MediaItem = {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
};

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <DashboardCard
      title="Media"
      subtitle={`${items.length} featured images currently used by posts`}
    >
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              {item.featured_image_url ? (
                <CardMedia
                  component="img"
                  height="160"
                  image={item.featured_image_url}
                  alt={item.title}
                />
              ) : null}
              <CardContent>
                <Typography variant="subtitle2" noWrap>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" noWrap>
                  {item.featured_image_url}
                </Typography>
                <Box mt={1.5}>
                  <Button
                    component={Link}
                    href={`/admin/posts/${item.id}`}
                    size="small"
                    variant="outlined"
                  >
                    Edit post
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {items.length === 0 ? (
          <Grid size={12}>
            <Typography color="textSecondary">
              No featured images found. Add image URLs on posts.
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </DashboardCard>
  );
}
