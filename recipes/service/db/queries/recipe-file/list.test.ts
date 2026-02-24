import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { listRecipeFile } from "./list.ts";

describe("listRecipeFile", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNotFoundError when recipe does not exist", async () => {
    const recipeId = "non-existent-id";
    const out = await listRecipeFile(dbKey, { recipeId });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
    expect(out.error?.message).toBe(
      `Recipe with id '${recipeId}' not found`,
    );
  });

  it("returns empty array when recipe has no files", async () => {
    const recipeId = "test-recipe-list-files";
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
        ingredients: [],
        instructionsMarkdown: "",
      },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    const out = await listRecipeFile(dbKey, { recipeId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toEqual([]);
  });

  it("returns files for recipe when present", async () => {
    const recipeId = "test-recipe-list-files-with-data";
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
        ingredients: [],
        instructionsMarkdown: "",
      },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    await db.insert(recipeFile).values({
      recipe_id: recipeId,
      blob_name: "recipes/recipe-id/file-id.pdf",
      file_original_name: "recipe.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploaded_by: "user-1",
    });

    const out = await listRecipeFile(dbKey, { recipeId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toHaveLength(1);
    expect(out.result[0].recipe_id).toBe(recipeId);
    expect(out.result[0].file_original_name).toBe("recipe.pdf");
    expect(out.result[0].mimetype).toBe("application/pdf");
    expect(out.result[0].size).toBe(1024);
  });

  it("returns all files for recipe when multiple exist", async () => {
    const recipeId = "test-recipe-list-files-multiple";
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

    await db.insert(recipeFile).values({
      recipe_id: recipeId,
      blob_name: "recipes/a/file1.pdf",
      file_original_name: "first.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    await db.insert(recipeFile).values({
      recipe_id: recipeId,
      blob_name: "recipes/a/file2.jpg",
      file_original_name: "second.jpg",
      mimetype: "image/jpeg",
      size: 200,
    });

    const out = await listRecipeFile(dbKey, { recipeId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toHaveLength(2);
    const names = out.result.map((f) => f.file_original_name).sort();
    expect(names).toEqual(["first.pdf", "second.jpg"]);
  });
});
