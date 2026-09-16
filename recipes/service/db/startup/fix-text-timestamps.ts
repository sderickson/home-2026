import { sql } from "drizzle-orm";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../instances.ts";

/**
 * Tables that historically stored ISO-8601 text for `created_at` / `updated_at`
 * while the Drizzle schema now expects unix-second integers (`mode: "timestamp"`).
 * ISO text makes `new Date(value * 1000)` → Invalid Date → 500s on file list APIs.
 */
const TIMESTAMP_TABLES = ["recipe_file", "recipe_note_file"] as const;

/**
 * Convert legacy ISO text timestamps to unix seconds so Drizzle's timestamp
 * mapping works. Safe to run on every startup (no-op when already fixed).
 */
export function fixTextTimestamps(dbKey: DbKey): {
  tables: Record<string, number>;
} {
  const db = recipesDbManager.get(dbKey);
  if (!db) {
    throw new Error("fixTextTimestamps: database instance not found");
  }

  const tables: Record<string, number> = {};

  for (const table of TIMESTAMP_TABLES) {
    const exists = db
      .all(
        sql`SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = ${table} LIMIT 1`,
      )
      .at(0);
    if (!exists) {
      continue;
    }

    const result = db.run(sql.raw(`
      UPDATE "${table}"
      SET
        created_at = CASE
          WHEN typeof(created_at) = 'text'
            AND strftime('%s', created_at) IS NOT NULL
            THEN CAST(strftime('%s', created_at) AS INTEGER)
          ELSE created_at
        END,
        updated_at = CASE
          WHEN typeof(updated_at) = 'text'
            AND strftime('%s', updated_at) IS NOT NULL
            THEN CAST(strftime('%s', updated_at) AS INTEGER)
          ELSE updated_at
        END
      WHERE
        (typeof(created_at) = 'text' AND strftime('%s', created_at) IS NOT NULL)
        OR (typeof(updated_at) = 'text' AND strftime('%s', updated_at) IS NOT NULL)
    `));

    tables[table] = result.changes ?? 0;
  }

  return { tables };
}
