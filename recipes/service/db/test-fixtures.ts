/**
 * Shared test fixtures and helpers for database tests.
 * Use insertTestCollection(db) in beforeEach when tests need a collection (e.g. for recipe inserts).
 * Use makeRecipeRow(overrides) when building recipe insert payloads.
 */
import type { SQLiteDatabase } from "drizzle-orm/sqlite-core";
import { collection } from "./schemas/collection.ts";

export const TEST_COLLECTION_ID = "test-collection";

/**
 * Inserts the default test collection. Call in beforeEach after connect()
 * when tests need a collection to exist (e.g. before inserting recipes).
 */
export async function insertTestCollection(
  db: SQLiteDatabase,
  overrides?: {
    id?: string;
    name?: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
  },
): Promise<void> {
  const now = overrides?.createdAt ?? new Date();
  const updatedAt = overrides?.updatedAt ?? now;
  await db.insert(collection).values({
    id: overrides?.id ?? TEST_COLLECTION_ID,
    name: overrides?.name ?? "Test",
    createdBy: overrides?.createdBy ?? "user-1",
    createdAt: now,
    updatedAt,
  });
}

/**
 * Returns a recipe insert row with collectionId and defaults.
 * Spread overrides to customize (e.g. makeRecipeRow({ title: "Other" })).
 */
export function makeRecipeRow(overrides: {
  title?: string;
  subtitle?: string;
  description?: string | null;
  isPublic?: boolean;
  createdBy?: string;
  updatedBy?: string;
  [k: string]: unknown;
} = {}): {
  collectionId: string;
  title: string;
  subtitle: string;
  description: string | null;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
} {
  const now = new Date();
  return {
    collectionId: TEST_COLLECTION_ID,
    title: "Test Recipe",
    subtitle: "Short",
    description: null,
    isPublic: true,
    createdBy: "user-1",
    createdAt: now,
    updatedBy: "user-1",
    updatedAt: now,
    ...overrides,
  };
}
