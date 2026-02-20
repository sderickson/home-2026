import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { getByIdRecipe } from "./get-by-id.ts";

describe("getByIdRecipe", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
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
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
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
});
