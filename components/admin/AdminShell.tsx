"use client";

import { styled, Container, Box } from "@mui/material";
import React, { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/admin/layout/header/Header";
import Sidebar from "@/components/admin/layout/sidebar/Sidebar";
import type { Profile } from "@/lib/types/cms";
import type { ProgramModules } from "@/lib/features/program-modules";
import { DEFAULT_PROGRAM_MODULES } from "@/lib/features/program-modules";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
  minWidth: 0,
  maxWidth: "100%",
  overflowX: "hidden",
}));

export default function AdminShell({
  children,
  profile,
  modules = DEFAULT_PROGRAM_MODULES,
  headerLogoSrc,
  siteName,
}: {
  children: React.ReactNode;
  profile: Profile;
  modules?: ProgramModules;
  headerLogoSrc: string;
  siteName: string;
}) {
  const pathname = usePathname();
  const [isSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(
    () => setMobileSidebarOpen((open) => !open),
    [],
  );
  const isPostEditor =
    pathname === "/admin/posts/new" || pathname.startsWith("/admin/posts/");

  return (
    <MainWrapper className="mainwrapper">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={closeMobileSidebar}
        role={profile.role}
        modules={modules}
        headerLogoSrc={headerLogoSrc}
        siteName={siteName}
      />
      <PageWrapper className="page-wrapper">
        <Header
          toggleMobileSidebar={toggleMobileSidebar}
          profile={profile}
        />
        <Container
          maxWidth={false}
          disableGutters={false}
          sx={{
            paddingTop: "20px",
            px: { xs: 1, sm: 2, md: 3 },
            maxWidth: isPostEditor ? "min(1440px, 100%)" : "1200px",
            width: "100%",
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
