import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { listRecipeNote } from "./list.ts";

describe("listRecipeNote", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns error when recipe not found", async () => {
    const out = await listRecipeNote(dbKey, { recipeId: "non-existent-id" });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
  });

  it("returns empty array when recipe has no notes", async () => {
    const recipeId = "test-recipe-list-notes";
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

    const out = await listRecipeNote(dbKey, { recipeId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toEqual([]);
  });

  it("returns notes for recipe when present", async () => {
    const recipeId = "test-recipe-list-notes-with-data";
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

    await db.insert(recipeNote).values({
      recipeId,
      recipeVersionId: null,
      body: "A note",
      everEdited: false,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });

    const out = await listRecipeNote(dbKey, { recipeId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toHaveLength(1);
    expect(out.result[0].body).toBe("A note");
    expect(out.result[0].recipeId).toBe(recipeId);
  });
});
