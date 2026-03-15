import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import {
  insertTestCollection,
  makeRecipeRow,
  TEST_COLLECTION_ID,
} from "../../test-fixtures.ts";
import { recipe } from "../../schemas/recipe.ts";
import { listRecipes } from "./list.ts";

describe("listRecipes", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db);
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("should return empty array when no recipes exist", async () => {
    const out = await listRecipes(dbKey, { collectionId: TEST_COLLECTION_ID });
    expect(out).toHaveProperty("result");
    assert("result" in out);
    assert(out.result !== undefined);
    expect(Array.isArray(out.result)).toBe(true);
    expect(out.result).toHaveLength(0);
  });

  it("should return all recipes in the collection", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await db
      .insert(recipe)
      .values([
        makeRecipeRow({ title: "First" }),
        makeRecipeRow({ title: "Second" }),
      ]);
    const out = await listRecipes(dbKey, {
      collectionId: TEST_COLLECTION_ID,
    });
    assert("result" in out);
    assert(out.result !== undefined);
    expect(out.result).toHaveLength(2);
    const titles = out.result.map((r) => r.title).sort();
    expect(titles).toEqual(["First", "Second"]);
  });

  it("should return array of recipe entities with expected shape", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const row = makeRecipeRow({
      title: "Shaped",
      subtitle: "Desc",
      description: "Long",
    });
    await db.insert(recipe).values(row);
    const out = await listRecipes(dbKey, {
      collectionId: TEST_COLLECTION_ID,
    });
    assert("result" in out);
    assert(out.result !== undefined);
    expect(out.result).toHaveLength(1);
    const r = out.result[0];
    expect(r).toHaveProperty("id");
    expect(r).toHaveProperty("title", "Shaped");
    expect(r).toHaveProperty("subtitle", "Desc");
    expect(r).toHaveProperty("description", "Long");
    expect(r).toHaveProperty("createdBy");
    expect(r).toHaveProperty("createdAt");
    expect(r).toHaveProperty("updatedBy");
    expect(r).toHaveProperty("updatedAt");
  });
});
