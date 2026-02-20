import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { createVersionRecipe } from "./create-version.ts";
import { getByIdRecipe } from "./get-by-id.ts";

describe("createVersionRecipe", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNotFoundError when recipe not found", async () => {
    const recipeId = "non-existent-recipe";
    const out = await createVersionRecipe(dbKey, {
      recipeId,
      content: {
        ingredients: [],
        instructionsMarkdown: "",
      },
      createdBy: "user-1",
    });
    expect(out.result).toBeUndefined();
    expect(out.error).toBeDefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
    expect(out.error.message).toBe(`Recipe with id '${recipeId}' not found`);
  });

  it("inserts new version, sets is_latest on new row, clears on previous", async () => {
    const recipeId = "test-recipe-create-version";
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
        instructionsMarkdown: "Original instructions.",
      },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    const newContent = {
      ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
      instructionsMarkdown: "Updated instructions.",
    };

    const out = await createVersionRecipe(dbKey, {
      recipeId,
      content: newContent,
      createdBy: "user-2",
    });

    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipeId).toBe(recipeId);
    expect(out.result.isLatest).toBe(true);
    expect(out.result.content).toEqual(newContent);
    expect(out.result.createdBy).toBe("user-2");

    const getOut = await getByIdRecipe(dbKey, recipeId);
    assert(getOut.result);
    expect(getOut.result.latestVersion.id).toBe(out.result.id);
    expect(getOut.result.latestVersion.content.instructionsMarkdown).toBe(
      "Updated instructions.",
    );

    const allVersions = await db
      .select({ id: recipeVersion.id, isLatest: recipeVersion.isLatest })
      .from(recipeVersion)
      .where(eq(recipeVersion.recipeId, recipeId));
    const latestCount = allVersions.filter((v) => v.isLatest).length;
    expect(latestCount).toBe(1);
  });
});
