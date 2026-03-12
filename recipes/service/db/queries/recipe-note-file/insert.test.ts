import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import { collection } from "../../schemas/collection.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { insertRecipeNoteFile } from "./insert.ts";

const TEST_COLLECTION_ID = "test-collection";

describe("insertRecipeNoteFile", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(collection).values({
      id: TEST_COLLECTION_ID,
      name: "Test",
      createdBy: "user-1",
      createdAt: now,
      updatedAt: now,
    });
  });

  afterEach(() => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNoteNotFoundError when note does not exist", async () => {
    const out = await insertRecipeNoteFile(dbKey, {
      recipeId: "some-recipe-id",
      recipe_note_id: "non-existent-note-id",
      blob_name: "notes/x/file.pdf",
      file_original_name: "file.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteNotFoundError);
    expect(out.error?.message).toBe(
      `Recipe note with id 'non-existent-note-id' not found`,
    );
  });

  it("returns RecipeNoteNotFoundError when note belongs to different recipe", async () => {
    const recipeId = "test-recipe-a";
    const otherRecipeId = "test-recipe-b";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      collectionId: TEST_COLLECTION_ID,
      title: "Recipe A",
      subtitle: "Short",
      description: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });
    await db.insert(recipe).values({
      id: otherRecipeId,
      collectionId: TEST_COLLECTION_ID,
      title: "Recipe B",
      subtitle: "Short",
      description: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });
    await db.insert(recipeVersion).values({
      recipeId: otherRecipeId,
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });
    const [noteRow] = await db
      .insert(recipeNote)
      .values({
        recipeId: otherRecipeId,
        body: "Note on B",
        everEdited: false,
        createdBy: "user-1",
        createdAt: now,
        updatedBy: "user-1",
        updatedAt: now,
      })
      .returning({ id: recipeNote.id });
    const noteId = noteRow!.id;

    const out = await insertRecipeNoteFile(dbKey, {
      recipeId,
      recipe_note_id: noteId,
      blob_name: "notes/b/file.pdf",
      file_original_name: "file.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteNotFoundError);
  });

  it("inserts and returns recipe note file when note exists", async () => {
    const recipeId = "test-recipe-insert-note-file";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      collectionId: TEST_COLLECTION_ID,
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

    const out = await insertRecipeNoteFile(dbKey, {
      recipeId,
      recipe_note_id: noteId,
      blob_name: "notes/note-id/file-id.pdf",
      file_original_name: "note-file.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploaded_by: "user-1",
    });

    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe_note_id).toBe(noteId);
    expect(out.result.blob_name).toBe("notes/note-id/file-id.pdf");
    expect(out.result.file_original_name).toBe("note-file.pdf");
    expect(out.result.mimetype).toBe("application/pdf");
    expect(out.result.size).toBe(1024);
    expect(out.result.uploaded_by).toBe("user-1");
    expect(out.result.id).toBeDefined();
    expect(out.result.created_at).toBeDefined();
    expect(out.result.updated_at).toBeDefined();
  });

  it("inserts and returns recipe note file when uploaded_by is omitted", async () => {
    const recipeId = "test-recipe-insert-note-file-no-uploader";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      collectionId: TEST_COLLECTION_ID,
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

    const out = await insertRecipeNoteFile(dbKey, {
      recipeId,
      recipe_note_id: noteId,
      blob_name: "notes/n/file.txt",
      file_original_name: "file.txt",
      mimetype: "text/plain",
      size: 0,
    });

    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe_note_id).toBe(noteId);
    expect(out.result.uploaded_by).toBeNull();
  });
});
