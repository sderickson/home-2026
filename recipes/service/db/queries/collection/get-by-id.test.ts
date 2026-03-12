import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { collection } from "../../schemas/collection.ts";
import { getByIdCollection } from "./get-by-id.ts";

describe("getByIdCollection", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await getByIdCollection(dbKey, "non-existent-id");
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe("Collection with id 'non-existent-id' not found");
  });

  it("returns collection when found", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date("2025-06-01T12:00:00Z");
    await db.insert(collection).values({
      id: "my-collection",
      name: "My Collection",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });

    const { result, error } = await getByIdCollection(dbKey, "my-collection");
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe("my-collection");
    expect(result.name).toBe("My Collection");
    expect(result.createdBy).toBe("owner@example.com");
    expect(result.createdAt).toEqual(now);
    expect(result.updatedAt).toEqual(now);
  });
});
