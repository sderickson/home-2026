import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionMemberNotFoundError } from "../../errors.ts";
import { collection, collectionMember } from "../../schemas/collection.ts";
import { removeCollectionMember } from "./remove.ts";
import { getByCollectionAndEmailCollectionMember } from "./get-by-collection-and-email.ts";
import { listCollectionMember } from "./list.ts";

describe("removeCollectionMember", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionMemberNotFoundError when member does not exist", async () => {
    const { result, error } = await removeCollectionMember(
      dbKey,
      "non-existent-member-id",
    );
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionMemberNotFoundError);
    expect(error.message).toBe(
      "Collection member with id 'non-existent-member-id' not found",
    );
  });

  it("removes member and returns the deleted row when found", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(collection).values({
      id: "col-remove",
      name: "Remove Col",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });
    const [inserted] = await db
      .insert(collectionMember)
      .values({
        collectionId: "col-remove",
        email: "to-remove@example.com",
        role: "viewer",
        isCreator: false,
        createdAt: now,
      })
      .returning();
    assert(inserted);

    const { result, error } = await removeCollectionMember(dbKey, inserted.id);
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe(inserted.id);
    expect(result.collectionId).toBe("col-remove");
    expect(result.email).toBe("to-remove@example.com");
    expect(result.role).toBe("viewer");
    expect(result.isCreator).toBe(false);

    const got = await getByCollectionAndEmailCollectionMember(dbKey, {
      collectionId: "col-remove",
      email: "to-remove@example.com",
    });
    expect(got.result).toBeUndefined();
    expect(got.error).toBeDefined();

    const list = await listCollectionMember(dbKey, {
      collectionId: "col-remove",
    });
    assert(list.result);
    expect(list.result).toHaveLength(0);
  });
});
