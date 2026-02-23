import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeNoteQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";

describe("GET /recipes/:id/notes (notesListRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

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
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with empty array when recipe has no notes", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/notes`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it("should return 200 with notes when recipe has notes", async () => {
    const { result: note } = await recipeNoteQueries.createRecipeNote(dbKey, {
      recipeId,
      body: "Tried less sugar.",
      everEdited: false,
      createdBy: seedUserId,
      updatedBy: seedUserId,
    });
    if (!note) throw new Error("Expected createRecipeNote to return result");

    const response = await request(app)
      .get(`/recipes/${recipeId}/notes`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: note.id,
      recipeId,
      body: "Tried less sugar.",
      everEdited: false,
      createdBy: seedUserId,
      updatedBy: seedUserId,
    });
    expect(response.body[0].createdAt).toBeDefined();
    expect(response.body[0].updatedAt).toBeDefined();
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get("/recipes/00000000-0000-0000-0000-000000000001/notes")
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
    const privateId = result.recipe.id;

    const response = await request(app)
      .get(`/recipes/${privateId}/notes`)
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });
});
