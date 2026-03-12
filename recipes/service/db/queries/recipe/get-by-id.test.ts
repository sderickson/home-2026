import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { collection } from "../../schemas/collection.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { getByIdRecipe } from "./get-by-id.ts";

const TEST_COLLECTION_ID = "test-collection";

describe("getByIdRecipe", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(collection).values({
      id: TEST_COLLECTION_ID,
      name: "Test",
      createdBy: "user-1",
      createdAt: now,
      updatedAt: now,
    });
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns error when recipe not found", async () => {
    const out = await getByIdRecipe(dbKey, "non-existent-id");
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
  });

  it("returns recipe with latest version when found", async () => {
    const recipeId = "test-recipe-get-by-id";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      collectionId: TEST_COLLECTION_ID,
      title: "Test Recipe",
      subtitle: "Short",
      description: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });

    await db.insert(recipeVersion).values({
      recipeId,
      content: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    const out = await getByIdRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe).toBeDefined();
    expect(out.result.recipe.id).toBe(recipeId);
    expect(out.result.recipe.title).toBe("Test Recipe");
    expect(out.result.latestVersion).toBeDefined();
    expect(out.result.latestVersion.recipeId).toBe(recipeId);
    expect(out.result.latestVersion.isLatest).toBe(true);
    expect(out.result.latestVersion.content.instructionsMarkdown).toBe(
      "Mix and bake.",
    );
  });

  it("returns recipe with placeholder version when recipe exists but has no versions (partial state)", async () => {
    const recipeId = "test-recipe-partial-state";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      collectionId: TEST_COLLECTION_ID,
      title: "Orphan Recipe",
      subtitle: "No version",
      description: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });
    // Intentionally no recipe_version rows (e.g. after a failed delete left recipe without versions)

    const out = await getByIdRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe.id).toBe(recipeId);
    expect(out.result.recipe.title).toBe("Orphan Recipe");
    expect(out.result.latestVersion.id).toBe("__partial__");
    expect(out.result.latestVersion.recipeId).toBe(recipeId);
    expect(out.result.latestVersion.isLatest).toBe(true);
    expect(out.result.latestVersion.content.ingredients).toEqual([]);
    expect(out.result.latestVersion.content.instructionsMarkdown).toBe("");
  });
});
