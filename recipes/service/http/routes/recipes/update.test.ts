import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import { recipesDb, recipeQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("PUT /recipes/:id", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Original Title",
      subtitle: "Short",
      description: null,
      isPublic: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with updated recipe when admin sends partial body", async () => {
    const updateBody = {
      title: "Updated Title",
      isPublic: true,
    } satisfies RecipesServiceRequestBody["updateRecipe"];

    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set(makeAdminHeaders(SEED_USER_ID))
      .send(updateBody);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: recipeId,
      title: updateBody.title,
      subtitle: "Short",
      isPublic: true,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .send({ title: "Updated" } satisfies RecipesServiceRequestBody["updateRecipe"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin requests update", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set(makeUserHeaders())
      .send({ title: "Hacked" } satisfies RecipesServiceRequestBody["updateRecipe"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .put(`/recipes/${fakeId}`)
      .set(makeAdminHeaders(SEED_USER_ID))
      .send({
        title: "Updated",
      } satisfies RecipesServiceRequestBody["updateRecipe"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
