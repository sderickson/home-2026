import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { insertRecipeFile } from "./insert.ts";

describe("insertRecipeFile", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNotFoundError when recipe does not exist", async () => {
    const out = await insertRecipeFile(dbKey, {
      recipe_id: "non-existent-id",
      blob_name: "recipes/x/file.pdf",
      file_original_name: "file.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
    expect(out.error?.message).toBe(
      `Recipe with id 'non-existent-id' not found`,
    );
  });

  it("inserts and returns recipe file when recipe exists", async () => {
    const recipeId = "test-recipe-insert-file";
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

    const out = await insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: "recipes/recipe-id/file-id.pdf",
      file_original_name: "recipe.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploaded_by: "user-1",
    });

    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe_id).toBe(recipeId);
    expect(out.result.blob_name).toBe("recipes/recipe-id/file-id.pdf");
    expect(out.result.file_original_name).toBe("recipe.pdf");
    expect(out.result.mimetype).toBe("application/pdf");
    expect(out.result.size).toBe(1024);
    expect(out.result.uploaded_by).toBe("user-1");
    expect(out.result.id).toBeDefined();
    expect(out.result.created_at).toBeDefined();
    expect(out.result.updated_at).toBeDefined();
  });

  it("inserts and returns recipe file when uploaded_by is omitted", async () => {
    const recipeId = "test-recipe-insert-file-no-uploader";
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

    const out = await insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: "recipes/a/file.txt",
      file_original_name: "file.txt",
      mimetype: "text/plain",
      size: 0,
    });

    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe_id).toBe(recipeId);
    expect(out.result.uploaded_by).toBeNull();
  });
});
