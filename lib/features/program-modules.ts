export const PROGRAM_MODULES_SETTING = "program_modules";

export type ProgramModules = {
  classic: boolean;
  schedule: boolean;
};

/** Hidden until flipped in Settings (or this default is changed). */
export const DEFAULT_PROGRAM_MODULES: ProgramModules = {
  classic: false,
  schedule: false,
};

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
