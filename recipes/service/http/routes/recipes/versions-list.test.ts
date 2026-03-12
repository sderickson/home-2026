import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb, recipeQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes/:id/versions (listRecipeVersions)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;

  beforeEach(async () => {
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

  it("should return 200 with versions when recipe exists", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/versions`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      recipeId,
      content: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
      isLatest: true,
      createdBy: SEED_USER_ID,
    });
    expect(response.body[0].id).toBeDefined();
    expect(response.body[0].createdAt).toBeDefined();
  });

  it("should return 200 when not authenticated for public recipe", async () => {
    const response = await request(app).get(`/recipes/${recipeId}/versions`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
  });

  it("should return 404 when not authenticated and recipe is private", async () => {
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
    const privateId = result.recipe.id;

    const response = await request(app).get(`/recipes/${privateId}/versions`);

    expect(response.status).toBe(404);
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get("/recipes/00000000-0000-0000-0000-000000000001/versions")
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });
});
