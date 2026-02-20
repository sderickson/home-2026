import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { versionsListRecipe } from "./versions-list.ts";

describe("versionsListRecipe", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNotFoundError when recipe not found", async () => {
    const recipeId = "non-existent-id";
    const out = await versionsListRecipe(dbKey, recipeId);
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
    expect(out.error.message).toBe(`Recipe with id '${recipeId}' not found`);
  });

  it("returns versions ordered by created_at ascending", async () => {
    const recipeId = "test-recipe-versions-list";
    const db = recipesDbManager.get(dbKey)!;
    const base = new Date("2025-01-01T00:00:00Z");

    await db.insert(recipe).values({
      id: recipeId,
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: base,
      updatedBy: "user-1",
      updatedAt: base,
    });

    const older = new Date("2025-01-02T00:00:00Z");
    const newer = new Date("2025-01-03T00:00:00Z");

    await db.insert(recipeVersion).values([
      {
        recipeId,
        content: {
          ingredients: [{ name: "A", quantity: "1", unit: "cup" }],
          instructionsMarkdown: "First.",
        },
        isLatest: false,
        createdBy: "user-1",
        createdAt: newer,
      },
      {
        recipeId,
        content: {
          ingredients: [{ name: "B", quantity: "2", unit: "tbsp" }],
          instructionsMarkdown: "Second.",
        },
        isLatest: true,
        createdBy: "user-1",
        createdAt: older,
      },
    ]);

    const out = await versionsListRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.versions).toHaveLength(2);
    expect(out.result.versions[0].createdAt).toEqual(older);
    expect(out.result.versions[0].content.instructionsMarkdown).toBe("Second.");
    expect(out.result.versions[1].createdAt).toEqual(newer);
    expect(out.result.versions[1].content.instructionsMarkdown).toBe("First.");
  });

  it("returns empty array when recipe has no versions", async () => {
    const recipeId = "test-recipe-no-versions";
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();

    await db.insert(recipe).values({
      id: recipeId,
      title: "No Versions",
      shortDescription: "Short",
      longDescription: null,
      isPublic: false,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });

    const out = await versionsListRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.versions).toHaveLength(0);
  });
});
