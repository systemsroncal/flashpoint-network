"use client";

import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Typography,
} from "@mui/material";
import ProfileMenu from "./Profile";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";
import type { Profile } from "@/lib/types/cms";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
  profile: Profile;
}

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  background: theme.palette.background.paper,
  justifyContent: "center",
  backdropFilter: "blur(4px)",
  [theme.breakpoints.up("lg")]: {
    minHeight: "70px",
  },
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: "100%",
  color: theme.palette.text.secondary,
}));

const Header = ({ toggleMobileSidebar, profile }: ItemType) => {
  const label =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email ||
    "Staff";

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          aria-label="notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {label} · {profile.role}
          </Typography>
          <ProfileMenu profile={profile} />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
