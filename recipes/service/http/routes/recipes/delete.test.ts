import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import { recipesDb, recipeQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("DELETE /recipes/:id", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "To Delete",
      subtitle: "Short",
      description: null,
      isPublic: true,
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

  it("should return 204 when admin deletes existing recipe", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).delete(
      "/recipes/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}`)
      .set(makeUserHeaders("other-user-id", "other@example.com"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .delete("/recipes/00000000-0000-0000-0000-000000000000")
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
