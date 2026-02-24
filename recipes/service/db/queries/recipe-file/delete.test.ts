import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { RecipeFileNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { deleteRecipeFile } from "./delete.ts";

describe("deleteRecipeFile", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeFileNotFoundError when file does not exist", async () => {
    const out = await deleteRecipeFile(dbKey, "non-existent-id");
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeFileNotFoundError);
    expect(out.error?.message).toBe(
      `Recipe file with id 'non-existent-id' not found`,
    );
  });

  it("deletes and returns the recipe file when it exists", async () => {
    const recipeId = "test-recipe-delete-file";
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
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    const [inserted] = await db
      .insert(recipeFile)
      .values({
        recipe_id: recipeId,
        blob_name: "recipes/a/file.pdf",
        file_original_name: "file.pdf",
        mimetype: "application/pdf",
        size: 100,
      })
      .returning();
    assert(inserted);

    const out = await deleteRecipeFile(dbKey, inserted.id);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.id).toBe(inserted.id);
    expect(out.result.recipe_id).toBe(recipeId);

    const remaining = await db
      .select()
      .from(recipeFile)
      .where(eq(recipeFile.id, inserted.id));
    expect(remaining).toHaveLength(0);
  });
});
