import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionMemberNotFoundError } from "../../errors.ts";
import { collection, collectionMember } from "../../schemas/collection.ts";
import { getByCollectionAndEmailCollectionMember } from "./get-by-collection-and-email.ts";

describe("getByCollectionAndEmailCollectionMember", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionMemberNotFoundError when no member for collection and email", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(collection).values({
      id: "col-1",
      name: "Col",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });

    const { result, error } = await getByCollectionAndEmailCollectionMember(
      dbKey,
      { collectionId: "col-1", email: "other@example.com" },
    );
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionMemberNotFoundError);
    expect(error.message).toBe(
      "Collection member not found for collection 'col-1' and email 'other@example.com'",
    );
  });

  it("returns member when found for collection and email", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(collection).values({
      id: "col-auth",
      name: "Auth Check Col",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(collectionMember).values({
      collectionId: "col-auth",
      email: "editor@example.com",
      role: "editor",
      isCreator: false,
      createdAt: now,
    });

    const { result, error } = await getByCollectionAndEmailCollectionMember(
      dbKey,
      { collectionId: "col-auth", email: "editor@example.com" },
    );
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.collectionId).toBe("col-auth");
    expect(result.email).toBe("editor@example.com");
    expect(result.role).toBe("editor");
    expect(result.isCreator).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
