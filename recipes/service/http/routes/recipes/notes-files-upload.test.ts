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

describe("POST /recipes/:id/notes/:noteId/files (notesFilesUploadRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;
  let noteId: string;

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
      body: "Test note.",
      everEdited: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    if (!note) throw new Error("Expected createRecipeNote to return result");
    noteId = note.id;

    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with file metadata when admin uploads file", async () => {
    const fileContent = "note attachment content";
    const filename = "attachment.txt";

    const response = await request(app)
      .post(`/recipes/${recipeId}/notes/${noteId}/files`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .attach("file", Buffer.from(fileContent), filename);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipeNoteId: noteId,
      fileOriginalName: filename,
      mimetype: "text/plain",
      size: fileContent.length,
      uploadedBy: SEED_USER_ID,
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.blobName).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
    expect(response.body.downloadUrl).toBeDefined();

    const listOut = await recipeNoteFileQueries.listRecipeNoteFile(dbKey, {
      recipeId,
      noteId,
    });
    expect(listOut.result).toHaveLength(1);
    expect(listOut.result![0].id).toBe(response.body.id);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/notes/${noteId}/files`)
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/notes/${noteId}/files`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .post(
        `/recipes/00000000-0000-0000-0000-000000000001/notes/${noteId}/files`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when note not found", async () => {
    const response = await request(app)
      .post(
        `/recipes/${recipeId}/notes/00000000-0000-0000-0000-000000000002/files`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_NOT_FOUND");
  });
});
