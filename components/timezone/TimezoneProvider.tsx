"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SITE_TIMEZONE } from "@/lib/timezone/constants";

const TimezoneContext = createContext<string>(DEFAULT_SITE_TIMEZONE);

export function TimezoneProvider({
  timeZone,
  children,
}: {
  timeZone: string;
  children: React.ReactNode;
}) {
  return (
    <TimezoneContext.Provider value={timeZone || DEFAULT_SITE_TIMEZONE}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone(): string {
  return useContext(TimezoneContext);
}
