// Required for downloadUrl to be a valid full URI (recipes API base from env).
if (!process.env.PROTOCOL) process.env.PROTOCOL = "http";
if (!process.env.DOMAIN) process.env.DOMAIN = "docker.localhost";

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeNoteQueries,
  recipeNoteFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";

describe("GET /recipes/:id/notes/:noteId/files (notesFilesListRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;
  let noteId: string;

  const seedUserId = "11111111-1111-1111-1111-111111111111";

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: seedUserId,
      updatedBy: seedUserId,
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
      createdBy: seedUserId,
      updatedBy: seedUserId,
    });
    if (!note) throw new Error("Expected createRecipeNote to return result");
    noteId = note.id;

    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with empty array when note has no files", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/notes/${noteId}/files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it("should return 200 with files when note has files", async () => {
    const { result: file } = await recipeNoteFileQueries.insertRecipeNoteFile(
      dbKey,
      {
        recipeId,
        recipe_note_id: noteId,
        blob_name: "notes/note-id/file-id.pdf",
        file_original_name: "note-file.pdf",
        mimetype: "application/pdf",
        size: 1024,
        uploaded_by: seedUserId,
      },
    );
    if (!file) throw new Error("Expected insertRecipeNoteFile to return result");

    const response = await request(app)
      .get(`/recipes/${recipeId}/notes/${noteId}/files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: file.id,
      recipeNoteId: noteId,
      blobName: "notes/note-id/file-id.pdf",
      fileOriginalName: "note-file.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploadedBy: seedUserId,
    });
    expect(response.body[0].createdAt).toBeDefined();
    expect(response.body[0].updatedAt).toBeDefined();
    expect(response.body[0].downloadUrl).toBeDefined();
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/00000000-0000-0000-0000-000000000001/notes/${noteId}/files`,
      )
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });

  it("should return 404 when note not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/${recipeId}/notes/00000000-0000-0000-0000-000000000002/files`,
      )
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });

  it("should return 404 when recipe is private and user is not admin", async () => {
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      title: "Private Recipe",
      shortDescription: "Private",
      longDescription: null,
      isPublic: false,
      createdBy: seedUserId,
      updatedBy: seedUserId,
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
        createdBy: seedUserId,
        updatedBy: seedUserId,
      },
    );
    if (!privateNote)
      throw new Error("Expected createRecipeNote to return result");

    const response = await request(app)
      .get(
        `/recipes/${privateRecipeId}/notes/${privateNote.id}/files`,
      )
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });
});
