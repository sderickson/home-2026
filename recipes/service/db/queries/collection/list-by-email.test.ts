import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { collectionMember } from "../../schemas/collection.ts";
import { listByEmailCollection } from "./list-by-email.ts";

describe("listByEmailCollection", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns empty array when email is not a member of any collection", async () => {
    const { result, error } = await listByEmailCollection(dbKey, {
      email: "nobody@example.com",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toEqual([]);
  });

  it("returns collections where the given email is a member", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "col-a",
      name: "Collection A",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });
    await insertTestCollection(db, {
      id: "col-b",
      name: "Collection B",
      createdBy: "other@example.com",
      createdAt: now,
      updatedAt: now,
    });
    await insertTestCollection(db, {
      id: "col-c",
      name: "Collection C",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(collectionMember).values([
      {
        collectionId: "col-a",
        email: "user@example.com",
        role: "editor",
        isCreator: false,
        createdAt: now,
      },
      {
        collectionId: "col-c",
        email: "user@example.com",
        role: "viewer",
        isCreator: false,
        createdAt: now,
      },
    ]);

    const { result, error } = await listByEmailCollection(dbKey, {
      email: "user@example.com",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toHaveLength(2);
    const ids = result.map((c) => c.id).sort();
    expect(ids).toEqual(["col-a", "col-c"]);
    const names = result.map((c) => c.name).sort();
    expect(names).toEqual(["Collection A", "Collection C"]);
  });

  it("returns collection entity with full shape when email is member of one collection", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date("2025-06-01T12:00:00Z");
    await insertTestCollection(db, {
      id: "single-col",
      name: "Solo Collection",
      createdBy: "creator@example.com",
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(collectionMember).values({
      collectionId: "single-col",
      email: "member@example.com",
      role: "owner",
      isCreator: true,
      createdAt: now,
    });

    const { result, error } = await listByEmailCollection(dbKey, {
      email: "member@example.com",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toHaveLength(1);
    const c = result[0];
    expect(c.id).toBe("single-col");
    expect(c.name).toBe("Solo Collection");
    expect(c.createdBy).toBe("creator@example.com");
    expect(c.createdAt).toEqual(now);
    expect(c.updatedAt).toEqual(now);
  });
});
