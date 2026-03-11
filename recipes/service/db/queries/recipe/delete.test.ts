import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { deleteRecipe } from "./delete.ts";
import { getByIdRecipe } from "./get-by-id.ts";

describe("deleteRecipe", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNotFoundError when recipe not found", async () => {
    const recipeId = "non-existent-id";
    const out = await deleteRecipe(dbKey, recipeId);
    expect(out.result).toBeUndefined();
    expect(out.error).toBeDefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
    expect(out.error.message).toBe(`Recipe with id '${recipeId}' not found`);
  });

  it("deletes recipe and versions when found", async () => {
    const recipeId = "test-recipe-delete";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
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

    const out = await deleteRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.id).toBe(recipeId);
    expect(out.result.title).toBe("Test Recipe");

    const getOut = await getByIdRecipe(dbKey, recipeId);
    expect(getOut.error).toBeDefined();
    expect(getOut.result).toBeUndefined();
  });

  it("deletes recipe and all dependents (files, notes, note-files, versions)", async () => {
    const recipeId = "test-recipe-delete-with-dependents";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      title: "Recipe with files and notes",
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
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });
    await db.insert(recipeFile).values({
      recipe_id: recipeId,
      blob_name: "recipes/a/file.pdf",
      file_original_name: "file.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    const [noteRow] = await db
      .insert(recipeNote)
      .values({
        recipeId,
        body: "A note",
        everEdited: false,
        createdBy: "user-1",
        createdAt: now,
        updatedBy: "user-1",
        updatedAt: now,
      })
      .returning({ id: recipeNote.id });
    const noteId = noteRow!.id;
    await db.insert(recipeNoteFile).values({
      recipe_note_id: noteId,
      blob_name: "notes/n/file.pdf",
      file_original_name: "file.pdf",
      mimetype: "application/pdf",
      size: 50,
    });

    const out = await deleteRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    assert(out.result);
    expect(out.result.id).toBe(recipeId);

    const getOut = await getByIdRecipe(dbKey, recipeId);
    expect(getOut.error).toBeDefined();
    expect(getOut.result).toBeUndefined();

    const remainingFiles = await db
      .select()
      .from(recipeFile)
      .where(eq(recipeFile.recipe_id, recipeId));
    const remainingNotes = await db
      .select()
      .from(recipeNote)
      .where(eq(recipeNote.recipeId, recipeId));
    expect(remainingFiles).toHaveLength(0);
    expect(remainingNotes).toHaveLength(0);
  });
});
