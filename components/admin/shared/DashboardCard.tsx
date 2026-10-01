import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  middlecontent?: ReactNode;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  middlecontent,
}: Props) => {
  return (
    <Card
      sx={{ padding: 0, maxWidth: "100%", overflow: "hidden" }}
      elevation={9}
      variant={undefined}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 3 },
          maxWidth: "100%",
          overflow: "hidden",
          "&:last-child": { pb: { xs: 2, md: 3 } },
        }}
      >
        {title ? (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            mb={3}
            sx={{ maxWidth: "100%", minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ wordBreak: "break-word" }}>
                {title}
              </Typography>
              {subtitle ? (
                <Typography variant="subtitle2" color="textSecondary">
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {action ? (
              <Box
                sx={{
                  flexShrink: 0,
                  maxWidth: "100%",
                  "& .MuiStack-root": { maxWidth: "100%" },
                  "& .MuiButton-root": {
                    maxWidth: "100%",
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                  },
                }}
              >
                {action}
              </Box>
            ) : null}
          </Stack>
        ) : null}
        <Box sx={{ maxWidth: "100%", minWidth: 0, overflowX: "auto" }}>
          {children}
        </Box>
      </CardContent>
      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
