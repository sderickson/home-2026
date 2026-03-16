import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { MenuNotFoundError } from "../../errors.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { createMenu } from "./create.ts";
import { updateMenu } from "./update.ts";

/**
 * updateMenu: 100% coverage.
 * One handled error: MenuNotFoundError when menu does not exist.
 * Success paths: update with updatedBy, update without updatedBy (unchanged).
 */
describe("updateMenu", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns MenuNotFoundError when menu does not exist", async () => {
    const { result, error } = await updateMenu(dbKey, {
      id: "non-existent-id",
      name: "Updated",
      groupings: [],
      editedByUserIds: ["u@example.com"],
    });
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(MenuNotFoundError);
    expect(error.message).toBe("Menu with id 'non-existent-id' not found");
  });

  it("updates menu and accepts optional updatedBy", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-1",
      name: "Test",
      createdBy: "owner@example.com",
    });
    const { result: created } = await createMenu(dbKey, {
      collectionId: "col-1",
      name: "Brunch",
      createdBy: "owner@example.com",
      groupings: [{ name: "Mains", recipeIds: [] }],
    });
    assert(created);

    const { result: updated, error } = await updateMenu(dbKey, {
      id: created.id,
      name: "Brunch Updated",
      groupings: [{ name: "Starters", recipeIds: ["r1"] }, { name: "Mains", recipeIds: [] }],
      editedByUserIds: ["owner@example.com", "editor@example.com"],
      updatedBy: "editor@example.com",
    });
    expect(error).toBeUndefined();
    expect(updated).toBeDefined();
    assert(updated);
    expect(updated.name).toBe("Brunch Updated");
    expect(updated.updatedBy).toBe("editor@example.com");
    expect(updated.editedByUserIds).toEqual(["owner@example.com", "editor@example.com"]);
    expect(updated.groupings).toEqual([
      { name: "Starters", recipeIds: ["r1"] },
      { name: "Mains", recipeIds: [] },
    ]);
  });

  it("updates menu without updatedBy and leaves it unchanged", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-2",
      name: "Other",
      createdBy: "u@example.com",
    });
    const { result: created } = await createMenu(dbKey, {
      collectionId: "col-2",
      name: "Dinner",
      createdBy: "u@example.com",
      groupings: [],
    });
    assert(created);
    expect(created.updatedBy).toBe("u@example.com");

    const { result: updated, error } = await updateMenu(dbKey, {
      id: created.id,
      name: "Dinner Revised",
      groupings: [{ name: "Desserts", recipeIds: [] }],
      editedByUserIds: ["u@example.com"],
    });
    expect(error).toBeUndefined();
    expect(updated).toBeDefined();
    assert(updated);
    expect(updated.name).toBe("Dinner Revised");
    expect(updated.updatedBy).toBe("u@example.com");
    expect(updated.groupings).toEqual([{ name: "Desserts", recipeIds: [] }]);
  });
});
