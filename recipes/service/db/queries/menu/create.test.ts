import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { menu } from "../../schemas/menu.ts";
import { createMenu } from "./create.ts";

/**
 * createMenu: 100% coverage.
 * One handled error: CollectionNotFoundError when collection does not exist.
 * Success paths: create with default editedByUserIds and with explicit editedByUserIds.
 */
describe("createMenu", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await createMenu(dbKey, {
      collectionId: "non-existent-id",
      name: "Test Menu",
      isPublic: true,
      createdBy: "u@example.com",
      groupings: [],
    });
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe(
      "Collection with id 'non-existent-id' not found",
    );
  });

  it("creates menu with default editedByUserIds [createdBy]", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-1",
      name: "Test",
      createdBy: "u@example.com",
    });

    const { result, error } = await createMenu(dbKey, {
      collectionId: "col-1",
      name: "Brunch",
      isPublic: true,
      createdBy: "u@example.com",
      groupings: [{ name: "Mains", recipeIds: ["r1"] }],
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.collectionId).toBe("col-1");
    expect(result.name).toBe("Brunch");
    expect(result.isPublic).toBe(true);
    expect(result.createdBy).toBe("u@example.com");
    expect(result.editedByUserIds).toEqual(["u@example.com"]);
    expect(result.groupings).toEqual([{ name: "Mains", recipeIds: ["r1"] }]);

    const rows = await db.select().from(menu).where(eq(menu.id, result.id)).limit(1);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Brunch");
  });

  it("creates menu with explicit editedByUserIds", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-2",
      name: "Other",
      createdBy: "owner@example.com",
    });

    const { result, error } = await createMenu(dbKey, {
      collectionId: "col-2",
      name: "Dinner",
      isPublic: false,
      createdBy: "owner@example.com",
      groupings: [{ name: "Starters", recipeIds: [] }, { name: "Desserts", recipeIds: ["d1"] }],
      editedByUserIds: ["owner@example.com", "editor@example.com"],
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.name).toBe("Dinner");
    expect(result.isPublic).toBe(false);
    expect(result.editedByUserIds).toEqual(["owner@example.com", "editor@example.com"]);
    expect(result.groupings).toEqual([
      { name: "Starters", recipeIds: [] },
      { name: "Desserts", recipeIds: ["d1"] },
    ]);
  });
});
