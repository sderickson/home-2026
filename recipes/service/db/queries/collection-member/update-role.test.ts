import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionMemberNotFoundError } from "../../errors.ts";
import { collection, collectionMember } from "../../schemas/collection.ts";
import { updateRoleCollectionMember } from "./update-role.ts";
import { getByCollectionAndEmailCollectionMember } from "./get-by-collection-and-email.ts";

describe("updateRoleCollectionMember", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionMemberNotFoundError when member does not exist", async () => {
    const { result, error } = await updateRoleCollectionMember(dbKey, {
      id: "non-existent-member-id",
      role: "owner",
    });
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionMemberNotFoundError);
    expect(error.message).toBe(
      "Collection member with id 'non-existent-member-id' not found",
    );
  });

  it("updates role and returns member when found", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(collection).values({
      id: "col-role",
      name: "Role Col",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });
    const [inserted] = await db
      .insert(collectionMember)
      .values({
        collectionId: "col-role",
        email: "editor@example.com",
        role: "editor",
        isCreator: false,
        createdAt: now,
      })
      .returning();
    assert(inserted);

    const { result, error } = await updateRoleCollectionMember(dbKey, {
      id: inserted.id,
      role: "viewer",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe(inserted.id);
    expect(result.collectionId).toBe("col-role");
    expect(result.email).toBe("editor@example.com");
    expect(result.role).toBe("viewer");
    expect(result.isCreator).toBe(false);

    const got = await getByCollectionAndEmailCollectionMember(dbKey, {
      collectionId: "col-role",
      email: "editor@example.com",
    });
    assert(got.result);
    expect(got.result.role).toBe("viewer");
  });
});
