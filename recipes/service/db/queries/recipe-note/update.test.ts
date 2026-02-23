import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import { recipe } from "../../schemas/recipe.ts";
import { createRecipeNote } from "./create.ts";
import { updateRecipeNote } from "./update.ts";

describe("updateRecipeNote", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns error when recipe note not found", async () => {
    const out = await updateRecipeNote(dbKey, {
      id: "non-existent-id",
      body: "Updated body",
      updatedBy: "user-1",
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteNotFoundError);
    expect(out.error.message).toBe(
      "Recipe note with id 'non-existent-id' not found",
    );
  });

  it("updates note body and sets ever_edited to true", async () => {
    const recipeId = "test-recipe-update-note";
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

    const createOut = await createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Original body",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(createOut.error).toBeUndefined();
    assert(createOut.result);
    const noteId = createOut.result.id;
    expect(createOut.result.everEdited).toBe(false);

    const out = await updateRecipeNote(dbKey, {
      id: noteId,
      body: "Updated body",
      updatedBy: "user-2",
    });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.id).toBe(noteId);
    expect(out.result.body).toBe("Updated body");
    expect(out.result.everEdited).toBe(true);
    expect(out.result.updatedBy).toBe("user-2");
    expect(out.result.recipeId).toBe(recipeId);
    expect(out.result.recipeVersionId).toBe(createOut.result.recipeVersionId);
    expect(out.result.createdBy).toBe("user-1");
    expect(out.result.createdAt).toEqual(createOut.result.createdAt);
    expect(out.result.updatedAt).toBeInstanceOf(Date);
    expect(out.result.updatedAt.getTime()).toBeGreaterThanOrEqual(
      createOut.result.updatedAt.getTime(),
    );
  });
});
