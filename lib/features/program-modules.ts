export const PROGRAM_MODULES_SETTING = "program_modules";

/** Only this account may view or change Classic/Schedule kill-switches. */
export const PROGRAM_MODULES_OWNER_EMAIL = "development@dreamsanimation.com";

export type ProgramModules = {
  classic: boolean;
  schedule: boolean;
};

/** Classic and schedule are on by default; Settings can still kill-switch them. */
export const DEFAULT_PROGRAM_MODULES: ProgramModules = {
  classic: true,
  schedule: true,
};

export function isProgramModulesOwnerEmail(email?: string | null): boolean {
  return email?.trim().toLowerCase() === PROGRAM_MODULES_OWNER_EMAIL;
}

export function parseProgramModules(value: unknown): ProgramModules {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    classic:
      typeof raw.classic === "boolean"
        ? raw.classic
        : DEFAULT_PROGRAM_MODULES.classic,
    schedule:
      typeof raw.schedule === "boolean"
        ? raw.schedule
        : DEFAULT_PROGRAM_MODULES.schedule,
  };
}
