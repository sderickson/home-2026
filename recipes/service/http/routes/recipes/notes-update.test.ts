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
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("PUT /recipes/:id/notes/:noteId (notesUpdateRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;
  let noteId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
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

    const createNote = await recipeNoteQueries.createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Original note body",
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

  it("should return 200 with updated note when admin and valid body", async () => {
    const body = {
      body: "Updated note body",
    } satisfies RecipesServiceRequestBody["notesUpdateRecipes"];

    const response = await request(app)
      .put(`/recipes/${recipeId}/notes/${noteId}`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: noteId,
      recipeId,
      body: body.body,
      everEdited: true,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}/notes/${noteId}`)
      .send({
        body: "Updated",
      } satisfies RecipesServiceRequestBody["notesUpdateRecipes"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}/notes/${noteId}`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .send({
        body: "Updated",
      } satisfies RecipesServiceRequestBody["notesUpdateRecipes"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when note not found", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}/notes/00000000-0000-0000-0000-000000000001`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        body: "Updated",
      } satisfies RecipesServiceRequestBody["notesUpdateRecipes"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_NOT_FOUND");
  });

  it("should return 404 when note belongs to different recipe", async () => {
    const { result: otherRecipe } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Other Recipe",
      subtitle: "Short",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    if (!otherRecipe) throw new Error("Expected createWithVersionRecipe to return result");
    // noteId belongs to recipeId; we request update under otherRecipe.recipe.id
    const response = await request(app)
      .put(`/recipes/${otherRecipe.recipe.id}/notes/${noteId}`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        body: "Updated",
      } satisfies RecipesServiceRequestBody["notesUpdateRecipes"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOTE_NOT_FOUND");
  });
});
