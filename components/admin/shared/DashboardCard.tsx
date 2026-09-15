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
    <Card sx={{ padding: 0 }} elevation={9} variant={undefined}>
      <CardContent sx={{ p: "30px" }}>
        {title ? (
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box>
              <Typography variant="h5">{title}</Typography>
              {subtitle ? (
                <Typography variant="subtitle2" color="textSecondary">
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
        ) : null}
        {children}
      </CardContent>
      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
