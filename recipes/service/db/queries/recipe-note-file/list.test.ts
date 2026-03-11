import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { listRecipeNoteFile } from "./list.ts";

describe("listRecipeNoteFile", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(() => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNoteNotFoundError when note does not exist", async () => {
    const recipeId = "test-recipe-no-note";
    const noteId = "non-existent-note-id";
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

    const out = await listRecipeNoteFile(dbKey, { recipeId, noteId });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteNotFoundError);
    expect(out.error?.message).toBe(
      `Recipe note with id '${noteId}' not found`,
    );
  });

  it("returns RecipeNoteNotFoundError when note belongs to different recipe", async () => {
    const recipeId = "test-recipe-a";
    const otherRecipeId = "test-recipe-b";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
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

    const out = await listRecipeNoteFile(dbKey, { recipeId, noteId });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNoteNotFoundError);
  });

  it("returns empty array when note has no files", async () => {
    const recipeId = "test-recipe-note-no-files";
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

    const out = await listRecipeNoteFile(dbKey, { recipeId, noteId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toEqual([]);
  });

  it("returns files for note when present", async () => {
    const recipeId = "test-recipe-note-with-files";
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
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });
    const [noteRow] = await db
      .insert(recipeNote)
      .values({
        recipeId,
        body: "Note with file",
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
      blob_name: "notes/note-id/file-id.pdf",
      file_original_name: "note-file.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploaded_by: "user-1",
    });

    const out = await listRecipeNoteFile(dbKey, { recipeId, noteId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toHaveLength(1);
    expect(out.result[0].recipe_note_id).toBe(noteId);
    expect(out.result[0].file_original_name).toBe("note-file.pdf");
    expect(out.result[0].mimetype).toBe("application/pdf");
    expect(out.result[0].size).toBe(1024);
  });

  it("returns all files for note when multiple exist", async () => {
    const recipeId = "test-recipe-note-multiple-files";
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

    await db.insert(recipeNoteFile).values({
      recipe_note_id: noteId,
      blob_name: "notes/n/file1.pdf",
      file_original_name: "first.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    await db.insert(recipeNoteFile).values({
      recipe_note_id: noteId,
      blob_name: "notes/n/file2.jpg",
      file_original_name: "second.jpg",
      mimetype: "image/jpeg",
      size: 200,
    });

    const out = await listRecipeNoteFile(dbKey, { recipeId, noteId });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result).toHaveLength(2);
    const names = out.result.map((f) => f.file_original_name).sort();
    expect(names).toEqual(["first.pdf", "second.jpg"]);
  });
});
