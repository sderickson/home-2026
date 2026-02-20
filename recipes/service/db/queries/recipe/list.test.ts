import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { recipe } from "../../schemas/recipe.ts";
import { listRecipes } from "./list.ts";

function makeRecipeRow(overrides: {
  title?: string;
  isPublic?: boolean;
  [k: string]: unknown;
} = {}) {
  const now = new Date();
  return {
    title: "Test Recipe",
    shortDescription: "Short",
    longDescription: null as string | null,
    isPublic: true,
    createdBy: "user-1",
    createdAt: now,
    updatedBy: "user-1",
    updatedAt: now,
    ...overrides,
  };
}

describe("listRecipes", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("should return empty array when no recipes exist", async () => {
    const out = await listRecipes(dbKey, {});
    expect(out).toHaveProperty("result");
    assert("result" in out);
    assert(out.result !== undefined);
    expect(Array.isArray(out.result)).toBe(true);
    expect(out.result).toHaveLength(0);
  });

  it("should return only public recipes when includePrivate is omitted", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await db
      .insert(recipe)
      .values([
        makeRecipeRow({ title: "Public One", isPublic: true }),
        makeRecipeRow({ title: "Private One", isPublic: false }),
      ]);
    const out = await listRecipes(dbKey, {});
    assert("result" in out);
    assert(out.result !== undefined);
    expect(out.result).toHaveLength(1);
    expect(out.result[0].title).toBe("Public One");
    expect(out.result[0].isPublic).toBe(true);
  });

  it("should return only public recipes when includePrivate is false", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await db
      .insert(recipe)
      .values([
        makeRecipeRow({ title: "Public", isPublic: true }),
        makeRecipeRow({ title: "Private", isPublic: false }),
      ]);
    const out = await listRecipes(dbKey, { includePrivate: false });
    assert("result" in out);
    assert(out.result !== undefined);
    expect(out.result).toHaveLength(1);
    expect(out.result[0].title).toBe("Public");
  });

  it("should return all recipes when includePrivate is true", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await db
      .insert(recipe)
      .values([
        makeRecipeRow({ title: "Public", isPublic: true }),
        makeRecipeRow({ title: "Private", isPublic: false }),
      ]);
    const out = await listRecipes(dbKey, { includePrivate: true });
    assert("result" in out);
    assert(out.result !== undefined);
    expect(out.result).toHaveLength(2);
    const titles = out.result.map((r) => r.title).sort();
    expect(titles).toEqual(["Private", "Public"]);
  });

  it("should return array of recipe entities with expected shape", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const row = makeRecipeRow({
      title: "Shaped",
      shortDescription: "Desc",
      longDescription: "Long",
    });
    await db.insert(recipe).values(row);
    const out = await listRecipes(dbKey, { includePrivate: true });
    assert("result" in out);
    assert(out.result !== undefined);
    expect(out.result).toHaveLength(1);
    const r = out.result[0];
    expect(r).toHaveProperty("id");
    expect(r).toHaveProperty("title", "Shaped");
    expect(r).toHaveProperty("shortDescription", "Desc");
    expect(r).toHaveProperty("longDescription", "Long");
    expect(r).toHaveProperty("isPublic", true);
    expect(r).toHaveProperty("createdBy");
    expect(r).toHaveProperty("createdAt");
    expect(r).toHaveProperty("updatedBy");
    expect(r).toHaveProperty("updatedAt");
  });
});
