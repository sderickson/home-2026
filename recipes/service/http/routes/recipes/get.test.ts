import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb, recipeQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes/:id", () => {
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

  it("should return 200 with recipe when found", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipe: {
        id: recipeId,
        title: "Test Recipe",
        subtitle: "Short",
        isPublic: true,
        createdBy: SEED_USER_ID,
        currentVersionId: expect.any(String),
      },
      currentVersion: {
        recipeId,
        isLatest: true,
        content: {
          ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
          instructionsMarkdown: "Mix and bake.",
        },
      },
    });
    expect(response.body.recipe.createdAt).toBeDefined();
    expect(response.body.recipe.updatedAt).toBeDefined();
    expect(response.body.currentVersion.id).toBeDefined();
    expect(response.body.currentVersion.createdAt).toBeDefined();
  });

  it("should return 401 or 500 when not authenticated (no auth context)", async () => {
    const response = await request(app).get(`/recipes/${recipeId}`);

    expect([401, 500]).toContain(response.status);
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get("/recipes/00000000-0000-0000-0000-000000000001")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
  });
});
