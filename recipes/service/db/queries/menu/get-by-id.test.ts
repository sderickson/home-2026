import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { menu } from "../../schemas/menu.ts";
import { getByIdMenu } from "./get-by-id.ts";

/**
 * getByIdMenu: 100% coverage.
 * No handled errors (ReturnsError<..., never>). Success paths: found (result) and not found (null).
 */
describe("getByIdMenu", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns null when menu does not exist", async () => {
    const { result, error } = await getByIdMenu(dbKey, "non-existent-id");
    expect(error).toBeUndefined();
    expect(result).toBeNull();
  });

  it("returns menu when found", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "col-1",
      name: "Test",
      createdBy: "u@example.com",
    });
    await db.insert(menu).values({
      collectionId: "col-1",
      name: "Brunch",
      isPublic: true,
      createdBy: "u@example.com",
      createdAt: now,
      updatedBy: "u@example.com",
      updatedAt: now,
      editedByUserIds: [],
      groupings: [{ name: "Mains", recipeIds: ["r1"] }],
    });

    const rows = await db.select().from(menu).where(eq(menu.name, "Brunch")).limit(1);
    const menuId = rows[0].id;

    const { result, error } = await getByIdMenu(dbKey, menuId);
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe(menuId);
    expect(result.name).toBe("Brunch");
    expect(result.isPublic).toBe(true);
    expect(result.groupings).toEqual([{ name: "Mains", recipeIds: ["r1"] }]);
  });
});
