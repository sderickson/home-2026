import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import { recipesDb, recipeQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("PUT /recipes/:id/versions/latest", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;
  let versionId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Recipe",
      subtitle: "Short",
      description: null,
      isPublic: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "# Step 1\nMix.",
      },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;
    versionId = result.version.id;
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with updated version when admin sends content body", async () => {
    const updateBody = {
      ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
      instructionsMarkdown: "# Step 1\nMix.\n\n# Step 2\nBake.",
    } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"];

    const response = await request(app)
      .put(`/recipes/${recipeId}/versions/latest`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(updateBody);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: versionId,
      recipeId,
      content: updateBody,
      isLatest: true,
      createdBy: SEED_USER_ID,
      createdAt: expect.any(String),
    } satisfies Partial<RecipesServiceResponseBody["updateRecipeVersionLatest"][200]>);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .put("/recipes/00000000-0000-0000-0000-000000000000/versions/latest")
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}/versions/latest`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .send({
        ingredients: [],
        instructionsMarkdown: "Hacked",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .put(`/recipes/${fakeId}/versions/latest`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when recipe has no versions", async () => {
    const collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createRecipe(dbKey, {
      collectionId,
      title: "Recipe",
      subtitle: "Short",
      description: null,
      isPublic: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    if (!result) throw new Error("Expected createRecipe to return result");
    const recipeNoVersionId = result.id;

    const response = await request(app)
      .put(`/recipes/${recipeNoVersionId}/versions/latest`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_VERSION_NOT_FOUND");
  });
});
