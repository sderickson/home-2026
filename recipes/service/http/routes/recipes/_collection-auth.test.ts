/**
 * Tests for requireCollectionMembership and getRecipeAndRequireCollectionAuth.
 * Behavior is exercised via endpoints that use them (list/create recipes, get recipe).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders, makeAdminHeaders } from "@saflib/express";
import { recipesDb, recipeQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

const NON_EXISTENT_COLLECTION_ID = "00000000-0000-0000-0000-000000000001";

describe("requireCollectionMembership (via list/create recipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("returns 401 when no auth", async () => {
    const response = await request(app).get("/recipes").query({ collectionId });

    expect(response.status).toBe(401);
  });

  it("returns 422 when collection does not exist", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId: NON_EXISTENT_COLLECTION_ID })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("COLLECTION_NOT_FOUND");
  });

  it("returns 403 when collection exists but caller is not a member", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId })
      .set(makeUserHeaders("other-user-id", "other@example.com"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("returns 200 when collection exists and caller is a member", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("returns 422 on create when collection does not exist", async () => {
    const response = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId: NON_EXISTENT_COLLECTION_ID,
        title: "Test",
        subtitle: "Short",
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("COLLECTION_NOT_FOUND");
  });
});

describe("getRecipeAndRequireCollectionAuth (via GET /recipes/:id)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Auth Test Recipe",
      subtitle: "Short",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "",
      },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe result");
    recipeId = result.recipe.id;
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("returns 404 when recipe not found", async () => {
    const response = await request(app)
      .get("/recipes/00000000-0000-0000-0000-000000000001")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("returns 200 when recipe exists and caller is collection member", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.recipe.id).toBe(recipeId);
  });

  it("returns 403 when recipe exists but caller is not a member", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}`)
      .set(makeUserHeaders("other-user-id", "other@example.com"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
