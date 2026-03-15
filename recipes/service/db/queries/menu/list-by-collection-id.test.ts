import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { menu } from "../../schemas/menu.ts";
import { listByCollectionIdMenu } from "./list-by-collection-id.ts";

/**
 * listByCollectionIdMenu: 100% coverage.
 * - One handled error: CollectionNotFoundError (reproduced below).
 * - Success paths: collection exists with 0, 1, or many menus.
 */
describe("listByCollectionIdMenu", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await listByCollectionIdMenu(dbKey, {
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

  it("returns empty array when collection exists but has no menus", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "empty-col",
      name: "Empty",
      createdBy: "owner@example.com",
    });

    const { result, error } = await listByCollectionIdMenu(dbKey, {
      collectionId: "empty-col",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toEqual([]);
  });

  it("returns single menu when collection has one menu", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "single-menu-col",
      name: "Single",
      createdBy: "owner@example.com",
    });
    await db.insert(menu).values({
      collectionId: "single-menu-col",
      name: "Dinner",
      createdBy: "owner@example.com",
      createdAt: now,
      updatedBy: "owner@example.com",
      updatedAt: now,
      editedByUserIds: ["user-1"],
      groupings: [{ name: "Mains", recipeIds: ["r1", "r2"] }],
    });

    const { result, error } = await listByCollectionIdMenu(dbKey, {
      collectionId: "single-menu-col",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Dinner");
    expect(result[0].editedByUserIds).toEqual(["user-1"]);
    expect(result[0].groupings).toEqual([
      { name: "Mains", recipeIds: ["r1", "r2"] },
    ]);
  });

  it("returns all menus for the collection", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "col-with-menus",
      name: "With Menus",
      createdBy: "owner@example.com",
    });
    await db.insert(menu).values([
      {
        collectionId: "col-with-menus",
        name: "Brunch",
        createdBy: "owner@example.com",
        createdAt: now,
        updatedBy: "owner@example.com",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [{ name: "Mains", recipeIds: [] }],
      },
      {
        collectionId: "col-with-menus",
        name: "Quick Dinner",
        createdBy: "owner@example.com",
        createdAt: now,
        updatedBy: "owner@example.com",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [],
      },
    ]);

    const { result, error } = await listByCollectionIdMenu(dbKey, {
      collectionId: "col-with-menus",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toHaveLength(2);
    const names = result.map((m) => m.name).sort();
    expect(names).toEqual(["Brunch", "Quick Dinner"]);
    const brunch = result.find((m) => m.name === "Brunch");
    assert(brunch);
    expect(brunch.groupings).toEqual([{ name: "Mains", recipeIds: [] }]);
  });
});
