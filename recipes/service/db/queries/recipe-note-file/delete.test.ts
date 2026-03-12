import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteFileNotFoundError } from "../../errors.ts";
import { insertTestCollection, makeRecipeRow } from "../../test-fixtures.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { deleteRecipeNoteFile } from "./delete.ts";

describe("deleteRecipeNoteFile", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db);
  });

  afterEach(() => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNoteFileNotFoundError when file does not exist", async () => {
    const out = await deleteRecipeNoteFile(dbKey, "non-existent-id");
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteFileNotFoundError);
    expect(out.error?.message).toBe(
      `Recipe note file with id 'non-existent-id' not found`,
    );
  });

  it("deletes and returns the recipe note file when it exists", async () => {
    const recipeId = "test-recipe-delete-note-file";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      ...makeRecipeRow(),
      id: recipeId,
    });
    await db.insert(recipeVersion).values({
      recipeId,
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });
    const [noteRow] = await db
      .insert(recipeNote)
      .values({
        recipeId,
        body: "Note",
        everEdited: false,
        createdBy: "user-1",
        createdAt: now,
        updatedBy: "user-1",
        updatedAt: now,
      })
      .returning({ id: recipeNote.id });
    const noteId = noteRow!.id;

    const [inserted] = await db
      .insert(recipeNoteFile)
      .values({
        recipe_note_id: noteId,
        blob_name: "notes/n/file.pdf",
        file_original_name: "file.pdf",
        mimetype: "application/pdf",
        size: 100,
      })
      .returning();
    assert(inserted);

    const out = await deleteRecipeNoteFile(dbKey, inserted.id);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.id).toBe(inserted.id);
    expect(out.result.recipe_note_id).toBe(noteId);

    const remaining = await db
      .select()
      .from(recipeNoteFile)
      .where(eq(recipeNoteFile.id, inserted.id));
    expect(remaining).toHaveLength(0);
  });
});
