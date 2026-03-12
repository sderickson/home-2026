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
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes/:id/note-files (recipeNoteFilesGetByNoteId)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;
  let noteId1: string;
  let noteId2: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
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
        instructionsMarkdown: "Steps.",
      },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;

    const { result: note1 } = await recipeNoteQueries.createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Note 1",
      everEdited: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    if (!note1) throw new Error("Expected createRecipeNote to return result");
    noteId1 = note1.id;

    const { result: note2 } = await recipeNoteQueries.createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Note 2",
      everEdited: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    if (!note2) throw new Error("Expected createRecipeNote to return result");
    noteId2 = note2.id;

    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("returns 200 with empty array when recipe has no note files", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/note-files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it("returns 200 with all note files for the recipe", async () => {
    const { result: file1 } = await recipeNoteFileQueries.insertRecipeNoteFile(
      dbKey,
      {
        recipeId,
        recipe_note_id: noteId1,
        blob_name: "notes/n1/f1.pdf",
        file_original_name: "a.pdf",
        mimetype: "application/pdf",
        size: 100,
        uploaded_by: SEED_USER_ID,
      },
    );
    if (!file1) throw new Error("Expected insertRecipeNoteFile to return result");

    const { result: file2 } = await recipeNoteFileQueries.insertRecipeNoteFile(
      dbKey,
      {
        recipeId,
        recipe_note_id: noteId2,
        blob_name: "notes/n2/f2.jpg",
        file_original_name: "b.jpg",
        mimetype: "image/jpeg",
        size: 200,
        uploaded_by: SEED_USER_ID,
      },
    );
    if (!file2) throw new Error("Expected insertRecipeNoteFile to return result");

    const response = await request(app)
      .get(`/recipes/${recipeId}/note-files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    const ids = response.body.map((f: { id: string }) => f.id).sort();
    expect(ids).toContain(file1.id);
    expect(ids).toContain(file2.id);
    expect(response.body.every((f: { recipeNoteId: string }) => [noteId1, noteId2].includes(f.recipeNoteId))).toBe(true);
    expect(response.body.every((f: { downloadUrl: string }) => typeof f.downloadUrl === "string" && f.downloadUrl.length > 0)).toBe(true);
  });

  it("returns 404 when recipe does not exist", async () => {
    const response = await request(app)
      .get("/recipes/00000000-0000-0000-0000-000000000099/note-files")
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });
});
