import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { collection } from "../../schemas/collection.ts";
import { updateCollection } from "./update.ts";

describe("updateCollection", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await updateCollection(dbKey, {
      id: "non-existent-id",
      name: "New Name",
    });
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe(
      "Collection with id 'non-existent-id' not found",
    );
  });

  it("updates name and updatedAt and returns the collection when found", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date("2025-06-01T12:00:00Z");
    await db.insert(collection).values({
      id: "col-to-update",
      name: "Original Name",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });

    const { result, error } = await updateCollection(dbKey, {
      id: "col-to-update",
      name: "Updated Name",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe("col-to-update");
    expect(result.name).toBe("Updated Name");
    expect(result.createdBy).toBe("owner@example.com");
    expect(result.createdAt).toEqual(now);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
  });
});
