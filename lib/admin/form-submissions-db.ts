/** Supabase errors when a table/migration is missing on an environment. */
export function isMissingRelationError(message: string): boolean {
  return /does not exist|schema cache|could not find the table|relation.*does not exist/i.test(
    message,
  );
}
