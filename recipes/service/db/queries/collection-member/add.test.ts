import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { collectionMember } from "../../schemas/collection.ts";
import { addCollectionMember } from "./add.ts";
import { getByCollectionAndEmailCollectionMember } from "./get-by-collection-and-email.ts";

describe("addCollectionMember", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await addCollectionMember(dbKey, {
      collectionId: "non-existent-id",
      email: "user@example.com",
      role: "viewer",
    });
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe(
      "Collection with id 'non-existent-id' not found",
    );
  });

  it("inserts new member when email does not exist for collection", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-add",
      name: "Add Col",
      createdBy: "owner@example.com",
    });

    const { result, error } = await addCollectionMember(dbKey, {
      collectionId: "col-add",
      email: "new@example.com",
      role: "editor",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.collectionId).toBe("col-add");
    expect(result.email).toBe("new@example.com");
    expect(result.role).toBe("editor");
    expect(result.isCreator).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);

    const got = await getByCollectionAndEmailCollectionMember(dbKey, {
      collectionId: "col-add",
      email: "new@example.com",
    });
    assert(got.result);
    expect(got.result.role).toBe("editor");
  });

  it("updates role when email already exists for collection and does not change is_creator", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "col-upsert",
      name: "Upsert Col",
      createdBy: "owner@example.com",
    });
    await db.insert(collectionMember).values({
      collectionId: "col-upsert",
      email: "existing@example.com",
      role: "viewer",
      isCreator: true,
      createdAt: now,
    });

    const { result, error } = await addCollectionMember(dbKey, {
      collectionId: "col-upsert",
      email: "existing@example.com",
      role: "owner",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.email).toBe("existing@example.com");
    expect(result.role).toBe("owner");
    expect(result.isCreator).toBe(true);

    const got = await getByCollectionAndEmailCollectionMember(dbKey, {
      collectionId: "col-upsert",
      email: "existing@example.com",
    });
    assert(got.result);
    expect(got.result.role).toBe("owner");
    expect(got.result.isCreator).toBe(true);
  });
});
