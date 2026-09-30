"use client";

import { useEffect } from "react";
import { useMediaQuery, Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import SidebarItems from "./SidebarItems";
import type { UserRole } from "@/lib/types/cms";
import type { ProgramModules } from "@/lib/features/program-modules";
import { DEFAULT_PROGRAM_MODULES } from "@/lib/features/program-modules";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
  isSidebarOpen: boolean;
  role: UserRole;
  modules?: ProgramModules;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
  role,
  modules = DEFAULT_PROGRAM_MODULES,
}: ItemType) => {
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme: { breakpoints: { up: (k: string) => string } }) =>
    theme.breakpoints.up("lg"),
  );

  useEffect(() => {
    if (!lgUp) {
      onSidebarClose();
    }
  }, [pathname, lgUp, onSidebarClose]);

  const sidebarWidth = "270px";

  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "7px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#eff2f7",
      borderRadius: "15px",
    },
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                boxSizing: "border-box",
                ...scrollbarStyles,
                width: sidebarWidth,
              },
            },
          }}
        >
          <Box sx={{ height: "100%" }}>
            <Box>
              <SidebarItems role={role} modules={modules} />
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
      slotProps={{
        paper: {
          sx: {
            boxShadow: (theme) => theme.shadows[8],
            width: sidebarWidth,
            ...scrollbarStyles,
          },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Menu
        </Typography>
        <IconButton aria-label="Close menu" onClick={onSidebarClose} size="small">
          <IconX size={20} />
        </IconButton>
      </Stack>
      <Box>
        <SidebarItems role={role} modules={modules} />
      </Box>
    </Drawer>
  );
};

export default MSidebar;
