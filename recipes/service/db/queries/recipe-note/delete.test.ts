import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import { recipe } from "../../schemas/recipe.ts";
import { createRecipeNote } from "./create.ts";
import { deleteRecipeNote } from "./delete.ts";
import { listRecipeNote } from "./list.ts";

describe("deleteRecipeNote", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNoteNotFoundError when recipe note not found", async () => {
    const noteId = "non-existent-id";
    const out = await deleteRecipeNote(dbKey, noteId);
    expect(out.result).toBeUndefined();
    expect(out.error).toBeDefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteNotFoundError);
    expect(out.error.message).toBe(
      `Recipe note with id '${noteId}' not found`,
    );
  });

  it("deletes recipe note when found", async () => {
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: "test-recipe-delete-note",
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
      recipeId: "test-recipe-delete-note",
      recipeVersionId: null,
      body: "Note to delete",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(createOut.error).toBeUndefined();
    expect(createOut.result).toBeDefined();
    assert(createOut.result);
    const noteId = createOut.result.id;

    const out = await deleteRecipeNote(dbKey, noteId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.id).toBe(noteId);
    expect(out.result.body).toBe("Note to delete");

    const listOut = await listRecipeNote(dbKey, {
      recipeId: "test-recipe-delete-note",
    });
    expect(listOut.error).toBeUndefined();
    expect(listOut.result).toBeDefined();
    expect(listOut.result?.find((n) => n.id === noteId)).toBeUndefined();
  });
});
