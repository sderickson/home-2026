import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { collection, collectionMember } from "../../schemas/collection.ts";
import { deleteCollection } from "./delete.ts";
import { getByIdCollection } from "./get-by-id.ts";

describe("deleteCollection", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await deleteCollection(dbKey, "non-existent-id");
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe(
      "Collection with id 'non-existent-id' not found",
    );
  });

  it("deletes collection and its members and returns the collection when found", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date("2025-06-01T12:00:00Z");
    await db.insert(collection).values({
      id: "col-to-delete",
      name: "To Delete",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(collectionMember).values({
      collectionId: "col-to-delete",
      email: "member@example.com",
      role: "editor",
      isCreator: false,
      createdAt: now,
    });

    const { result, error } = await deleteCollection(dbKey, "col-to-delete");
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe("col-to-delete");
    expect(result.name).toBe("To Delete");
    expect(result.createdBy).toBe("owner@example.com");

    const got = await getByIdCollection(dbKey, "col-to-delete");
    expect(got.result).toBeUndefined();
    expect(got.error).toBeDefined();

    const members = await db
      .select()
      .from(collectionMember)
      .where(eq(collectionMember.collectionId, "col-to-delete"));
    expect(members).toHaveLength(0);
  });
});
