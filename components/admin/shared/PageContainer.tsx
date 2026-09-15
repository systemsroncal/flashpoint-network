import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

type Props = {
  description?: string;
  children: ReactNode;
  title?: string;
};

/**
 * Admin page chrome. Do NOT emit raw <title>/<meta> into the body —
 * that confuses App Router document metadata and can contribute to
 * Turbopack performance.measure aborts during client transitions.
 */
export default function PageContainer({ title, description, children }: Props) {
  return (
    <Box>
      {title || description ? (
        <Box mb={2.5}>
          {title ? (
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      {children}
    </Box>
  );
}
