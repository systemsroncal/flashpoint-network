"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import { signOutAction } from "@/lib/auth/actions";
import type { Profile } from "@/lib/types/cms";

export default function ProfileMenu({ profile }: { profile: Profile }) {
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const initials =
    [profile.first_name?.[0], profile.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    "FP";

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="account menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(Boolean(anchorEl2) && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          alt={profile.full_name || "Staff"}
          src={profile.avatar_url || undefined}
          sx={{
            width: 35,
            height: 35,
            bgcolor: "primary.main",
            fontSize: 14,
          }}
        >
          {initials}
        </Avatar>
      </IconButton>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "220px",
          },
        }}
      >
        <MenuItem component={Link} href="/admin/users" onClick={handleClose2}>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>Users</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href="/admin/settings"
          onClick={handleClose2}
        >
          <ListItemIcon>
            <IconSettings width={20} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2} display="flex" flexDirection="column" gap={1}>
          <Button
            href="/"
            variant="outlined"
            color="primary"
            component={Link}
            fullWidth
          >
            View Site
          </Button>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<IconLogout width={18} />}
            >
              Sign out
            </Button>
          </form>
        </Box>
      </Menu>
    </Box>
  );
}
