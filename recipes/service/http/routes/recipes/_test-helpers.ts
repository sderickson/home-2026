/**
 * Shared test helpers for recipe HTTP route tests.
 * Use createTestCollection(dbKey) in beforeEach to get a collection id for seeding recipes.
 */
import type { DbKey } from "@saflib/drizzle";
import { collectionQueries } from "@sderickson/recipes-db";

export const SEED_USER_ID = "11111111-1111-1111-1111-111111111111";

/**
 * Creates a test collection and returns its id. Call once per test (e.g. in beforeEach)
 * before creating recipes so they have a valid collectionId.
 */
export async function createTestCollection(dbKey: DbKey): Promise<string> {
  const { result, error } = await collectionQueries.createCollection(dbKey, {
    name: "Test",
    creatorEmail: SEED_USER_ID,
  });
  if (error || !result) {
    throw new Error(
      error ? `createCollection failed: ${String(error)}` : "createCollection returned no result",
    );
  }
  return result.id;
}
