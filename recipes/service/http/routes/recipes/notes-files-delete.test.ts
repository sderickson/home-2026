import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeNoteQueries,
  recipeNoteFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("DELETE /recipes/:id/notes/:noteId/files/:fileId (notesFilesDeleteRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;
  let noteId: string;
  let fileId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Test Recipe",
      subtitle: "Short",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;

    const { result: note } = await recipeNoteQueries.createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Test note.",
      everEdited: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    if (!note) throw new Error("Expected createRecipeNote to return result");
    noteId = note.id;

    const { result: file } = await recipeNoteFileQueries.insertRecipeNoteFile(
      dbKey,
      {
        recipeId,
        recipe_note_id: noteId,
        blob_name: `notes/${noteId}/test-file.pdf`,
        file_original_name: "test.pdf",
        mimetype: "application/pdf",
        size: 100,
        uploaded_by: SEED_USER_ID,
      },
    );
    if (!file) throw new Error("Expected insertRecipeNoteFile to return result");
    fileId = file.id;

    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 204 when admin deletes existing note file", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/notes/${noteId}/files/${fileId}`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const listOut = await recipeNoteFileQueries.listRecipeNoteFile(dbKey, {
      recipeId,
      noteId,
    });
    expect(listOut.result).toHaveLength(0);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).delete(
      `/recipes/${recipeId}/notes/${noteId}/files/${fileId}`,
    );

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/notes/${noteId}/files/${fileId}`)
      .set(makeUserHeaders("other-user-id", "other@example.com"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .delete(
        `/recipes/00000000-0000-0000-0000-000000000001/notes/${noteId}/files/${fileId}`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when note not found", async () => {
    const response = await request(app)
      .delete(
        `/recipes/${recipeId}/notes/00000000-0000-0000-0000-000000000002/files/${fileId}`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_NOT_FOUND");
  });

  it("should return 404 when file not found", async () => {
    const response = await request(app)
      .delete(
        `/recipes/${recipeId}/notes/${noteId}/files/00000000-0000-0000-0000-000000000003`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_FILE_NOT_FOUND");
  });
});
