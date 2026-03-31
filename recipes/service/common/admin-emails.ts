import { typedEnv } from "./env.ts";

function adminEmailSet(): Set<string> {
  return new Set(
    (typedEnv.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** True when `email` is listed in `ADMIN_EMAILS` (comma-separated, case-insensitive). */
export function isRecipesAdminEmail(email: string): boolean {
  return adminEmailSet().has(email.trim().toLowerCase());
}
