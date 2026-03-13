import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { MenuNotFoundError } from "../../errors.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { menu } from "../../schemas/menu.ts";
import { createMenu } from "./create.ts";
import { deleteMenu } from "./delete.ts";

/**
 * deleteMenu: 100% coverage.
 * One handled error: MenuNotFoundError when menu does not exist.
 * Success path: delete existing menu and return deleted row.
 */
describe("deleteMenu", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns MenuNotFoundError when menu does not exist", async () => {
    const { result, error } = await deleteMenu(dbKey, "non-existent-id");
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(MenuNotFoundError);
    expect(error.message).toBe("Menu with id 'non-existent-id' not found");
  });

  it("deletes menu and returns deleted row", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-1",
      name: "Test",
      createdBy: "u@example.com",
    });
    const { result: created } = await createMenu(dbKey, {
      collectionId: "col-1",
      name: "To Delete",
      isPublic: true,
      createdBy: "u@example.com",
      groupings: [{ name: "Mains", recipeIds: [] }],
    });
    assert(created);

    const { result: deleted, error } = await deleteMenu(dbKey, created.id);
    expect(error).toBeUndefined();
    expect(deleted).toBeDefined();
    assert(deleted);
    expect(deleted.id).toBe(created.id);
    expect(deleted.name).toBe("To Delete");

    const rows = await db.select().from(menu).where(eq(menu.id, created.id)).limit(1);
    expect(rows).toHaveLength(0);
  });
});
