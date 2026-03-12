import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { collectionMember } from "../../schemas/collection.ts";
import { listCollectionMember } from "./list.ts";

describe("listCollectionMember", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await listCollectionMember(dbKey, {
      collectionId: "non-existent-id",
    });
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe(
      "Collection with id 'non-existent-id' not found",
    );
  });

  it("returns empty array when collection exists but has no members", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "empty-col",
      name: "Empty",
      createdBy: "owner@example.com",
    });

    const { result, error } = await listCollectionMember(dbKey, {
      collectionId: "empty-col",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toEqual([]);
  });

  it("returns all members when collection has members", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "col-with-members",
      name: "With Members",
      createdBy: "owner@example.com",
    });
    await db.insert(collectionMember).values([
      {
        collectionId: "col-with-members",
        email: "owner@example.com",
        role: "owner",
        isCreator: true,
        createdAt: now,
      },
      {
        collectionId: "col-with-members",
        email: "editor@example.com",
        role: "editor",
        isCreator: false,
        createdAt: now,
      },
    ]);

    const { result, error } = await listCollectionMember(dbKey, {
      collectionId: "col-with-members",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toHaveLength(2);
    const emails = result.map((m) => m.email).sort();
    expect(emails).toEqual(["editor@example.com", "owner@example.com"]);
    const owner = result.find((m) => m.email === "owner@example.com");
    assert(owner);
    expect(owner.role).toBe("owner");
    expect(owner.isCreator).toBe(true);
  });
});
