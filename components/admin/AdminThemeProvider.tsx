"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";

export default function AdminThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", prepend: true }}>
      <ThemeProvider theme={baselightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
