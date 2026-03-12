import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeNoteQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("DELETE /recipes/:id/notes/:noteId (notesDeleteRecipes)", () => {
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
      isPublic: true,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;

    const createNote = await recipeNoteQueries.createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Note to delete",
      everEdited: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    if (!createNote.result) throw new Error("Expected createRecipeNote to return result");
    noteId = createNote.result.id;

    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 204 when admin deletes existing note", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/notes/${noteId}`)
      .set(makeAdminHeaders(SEED_USER_ID));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/notes/${noteId}`);

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/notes/${noteId}`)
      .set(makeUserHeaders());

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when note not found", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/notes/00000000-0000-0000-0000-000000000001`)
      .set(makeAdminHeaders(SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_NOT_FOUND");
  });
});
