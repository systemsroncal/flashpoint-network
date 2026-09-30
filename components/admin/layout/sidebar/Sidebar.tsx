"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
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
  headerLogoSrc: string;
  siteName: string;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
  role,
  modules = DEFAULT_PROGRAM_MODULES,
  headerLogoSrc,
  siteName,
}: ItemType) => {
  const pathname = usePathname();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up("lg"), { noSsr: true });
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      onSidebarClose();
    }
  }, [pathname, onSidebarClose]);

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
              <SidebarItems
                role={role}
                modules={modules}
                headerLogoSrc={headerLogoSrc}
                siteName={siteName}
              />
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
        <SidebarItems
          role={role}
          modules={modules}
          headerLogoSrc={headerLogoSrc}
          siteName={siteName}
        />
      </Box>
    </Drawer>
  );
};

export default MSidebar;
