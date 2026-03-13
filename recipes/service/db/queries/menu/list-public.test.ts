import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { insertTestCollection } from "../../test-fixtures.ts";
import { menu } from "../../schemas/menu.ts";
import { listPublicMenu } from "./list-public.ts";

/**
 * listPublicMenu: 100% coverage.
 * No handled errors (ReturnsError<..., never>). Success paths: empty and non-empty result.
 */
describe("listPublicMenu", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns empty array when no public menus exist", async () => {
    const { result, error } = await listPublicMenu(dbKey);
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toEqual([]);
  });

  it("returns only public menus across all collections", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await insertTestCollection(db, {
      id: "col-a",
      name: "Collection A",
      createdBy: "u@example.com",
    });
    await insertTestCollection(db, {
      id: "col-b",
      name: "Collection B",
      createdBy: "u@example.com",
    });
    await db.insert(menu).values([
      {
        collectionId: "col-a",
        name: "Public Menu A",
        isPublic: true,
        createdBy: "u@example.com",
        createdAt: now,
        updatedBy: "u@example.com",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [],
      },
      {
        collectionId: "col-a",
        name: "Private Menu A",
        isPublic: false,
        createdBy: "u@example.com",
        createdAt: now,
        updatedBy: "u@example.com",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [],
      },
      {
        collectionId: "col-b",
        name: "Public Menu B",
        isPublic: true,
        createdBy: "u@example.com",
        createdAt: now,
        updatedBy: "u@example.com",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [{ name: "Mains", recipeIds: [] }],
      },
    ]);

    const { result, error } = await listPublicMenu(dbKey);
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result).toHaveLength(2);
    const names = result.map((m) => m.name).sort();
    expect(names).toEqual(["Public Menu A", "Public Menu B"]);
    expect(result.every((m) => m.isPublic === true)).toBe(true);
  });
});
