"use client";

import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
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
}));

export default function AdminShell({
  children,
  profile,
  modules = DEFAULT_PROGRAM_MODULES,
}: {
  children: React.ReactNode;
  profile: Profile;
  modules?: ProgramModules;
}) {
  const pathname = usePathname();
  const [isSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isPostEditor =
    pathname === "/admin/posts/new" || pathname.startsWith("/admin/posts/");

  return (
    <MainWrapper className="mainwrapper">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
        role={profile.role}
        modules={modules}
      />
      <PageWrapper className="page-wrapper">
        <Header
          toggleMobileSidebar={() => setMobileSidebarOpen((open) => !open)}
          profile={profile}
        />
        <Container
          maxWidth={false}
          sx={{
            paddingTop: "20px",
            px: { xs: 1.5, sm: 2, md: 3 },
            maxWidth: isPostEditor ? "min(1440px, 100%)" : "1200px",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
