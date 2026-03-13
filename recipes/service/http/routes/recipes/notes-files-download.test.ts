import { Readable } from "stream";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { createObjectStore } from "@saflib/object-store";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeNoteQueries,
  recipeNoteFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes/:id/notes/:noteId/files/:fileId/blob (notesFilesDownloadRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;
  let noteId: string;
  let fileId: string;
  let container: ReturnType<typeof createObjectStore>;

  beforeEach(async () => {
    container = createObjectStore({ type: "test" });
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Test Recipe",
      subtitle: "Short",
      description: null,
      isPublic: true,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "Mix.",
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

    const insertOut = await recipeNoteFileQueries.insertRecipeNoteFile(dbKey, {
      recipeId,
      recipe_note_id: noteId,
      blob_name: `notes/${noteId}/test-blob.pdf`,
      file_original_name: "note-doc.pdf",
      mimetype: "application/pdf",
      size: 14,
      uploaded_by: SEED_USER_ID,
    });
    if (!insertOut.result) throw new Error("Expected insertRecipeNoteFile to return result");
    fileId = insertOut.result.id;

    const uploadResult = await container.uploadFile(
      insertOut.result.blob_name,
      Readable.from(Buffer.from("note file content")),
      { mimetype: "application/pdf", filename: "note-doc.pdf" },
    );
    if (uploadResult.error) throw uploadResult.error;

    app = createRecipesHttpApp({
      recipesDbKey: dbKey,
      recipesFileContainer: container,
    });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with file binary and correct headers when user requests public recipe note file", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/notes/${noteId}/files/${fileId}/blob`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("application/pdf");
    expect(response.headers["content-disposition"]).toContain("inline");
    expect(response.headers["content-disposition"]).toContain("note-doc.pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.toString()).toBe("note file content");
  });

  it("should return 200 when admin downloads file from private recipe note", async () => {
    const { result: privateResult } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Private Recipe",
        subtitle: "Private",
        description: null,
        isPublic: false,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    if (!privateResult) throw new Error("Expected createWithVersionRecipe to return result");
    const privateRecipeId = privateResult.recipe.id;
    const { result: privateNote } = await recipeNoteQueries.createRecipeNote(
      dbKey,
      {
        recipeId: privateRecipeId,
        body: "Private note.",
        everEdited: false,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
      },
    );
    if (!privateNote) throw new Error("Expected createRecipeNote to return result");
    const privFile = await recipeNoteFileQueries.insertRecipeNoteFile(dbKey, {
      recipeId: privateRecipeId,
      recipe_note_id: privateNote.id,
      blob_name: `notes/${privateNote.id}/priv.pdf`,
      file_original_name: "priv.pdf",
      mimetype: "application/pdf",
      size: 0,
      uploaded_by: SEED_USER_ID,
    });
    if (!privFile.result) throw new Error("Expected insertRecipeNoteFile to return result");
    const uploadPriv = await container.uploadFile(
      privFile.result.blob_name,
      Readable.from(Buffer.from("")),
      {},
    );
    if (uploadPriv.error) throw uploadPriv.error;

    const response = await request(app)
      .get(
        `/recipes/${privateRecipeId}/notes/${privateNote.id}/files/${privFile.result.id}/blob`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("application/pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).get(
      `/recipes/${recipeId}/notes/${noteId}/files/${fileId}/blob`,
    );

    expect(response.status).toBe(401);
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/00000000-0000-0000-0000-000000000001/notes/${noteId}/files/${fileId}/blob`,
      )
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when note not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/${recipeId}/notes/00000000-0000-0000-0000-000000000002/files/${fileId}/blob`,
      )
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_NOT_FOUND");
  });

  it("should return 404 when file not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/${recipeId}/notes/${noteId}/files/00000000-0000-0000-0000-000000000003/blob`,
      )
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_FILE_NOT_FOUND");
  });

  it("should return 200 when member requests file from private recipe note in collection", async () => {
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Private Recipe",
      subtitle: "Private",
      description: null,
      isPublic: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    const privateRecipeId = result.recipe.id;
    const { result: privateNote } = await recipeNoteQueries.createRecipeNote(
      dbKey,
      {
        recipeId: privateRecipeId,
        body: "Private note.",
        everEdited: false,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
      },
    );
    if (!privateNote) throw new Error("Expected createRecipeNote to return result");
    const privFile = await recipeNoteFileQueries.insertRecipeNoteFile(dbKey, {
      recipeId: privateRecipeId,
      recipe_note_id: privateNote.id,
      blob_name: `notes/${privateNote.id}/priv.pdf`,
      file_original_name: "priv.pdf",
      mimetype: "application/pdf",
      size: 0,
      uploaded_by: SEED_USER_ID,
    });
    if (!privFile.result) throw new Error("Expected insertRecipeNoteFile to return result");
    const uploadPriv = await container.uploadFile(
      privFile.result.blob_name,
      Readable.from(Buffer.from("")),
      {},
    );
    if (uploadPriv.error) throw uploadPriv.error;

    const response = await request(app)
      .get(
        `/recipes/${privateRecipeId}/notes/${privateNote.id}/files/${privFile.result.id}/blob`,
      )
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
  });
});
