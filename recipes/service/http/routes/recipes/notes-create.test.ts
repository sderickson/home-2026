import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

const adminUserId = "11111111-1111-1111-1111-111111111111";

describe("POST /recipes/:id/notes (notesCreateRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
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

  it("should return 200 with created note when admin and valid body", async () => {
    const body = {
      body: "Tried less sugar.",
    } satisfies RecipesServiceRequestBody["notesCreateRecipes"];

    const response = await request(app)
      .post(`/recipes/${recipeId}/notes`)
      .set(makeAdminHeaders(adminUserId))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipeId,
      body: body.body,
      everEdited: false,
      createdBy: adminUserId,
      updatedBy: adminUserId,
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("should return 200 with note and recipeVersionId when provided", async () => {
    const { result: withVersion } = await recipeQueries.createWithVersionRecipe(dbKey, {
      title: "With version",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    if (!withVersion) throw new Error("Expected createWithVersionRecipe to return result");
    const body = {
      body: "Note for version",
      recipeVersionId: withVersion.version.id,
    } satisfies RecipesServiceRequestBody["notesCreateRecipes"];

    const response = await request(app)
      .post(`/recipes/${withVersion.recipe.id}/notes`)
      .set(makeAdminHeaders(adminUserId))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipeId: withVersion.recipe.id,
      recipeVersionId: withVersion.version.id,
      body: body.body,
      everEdited: false,
      createdBy: adminUserId,
      updatedBy: adminUserId,
    });
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/notes`)
      .send({
        body: "A note",
      } satisfies RecipesServiceRequestBody["notesCreateRecipes"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/notes`)
      .set(makeUserHeaders())
      .send({
        body: "A note",
      } satisfies RecipesServiceRequestBody["notesCreateRecipes"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .post("/recipes/00000000-0000-0000-0000-000000000001/notes")
      .set(makeAdminHeaders(adminUserId))
      .send({
        body: "A note",
      } satisfies RecipesServiceRequestBody["notesCreateRecipes"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when recipeVersionId does not exist for recipe", async () => {
    const body = {
      body: "Note",
      recipeVersionId: "00000000-0000-0000-0000-000000000002",
    } satisfies RecipesServiceRequestBody["notesCreateRecipes"];

    const response = await request(app)
      .post(`/recipes/${recipeId}/notes`)
      .set(makeAdminHeaders(adminUserId))
      .send(body);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_VERSION_NOT_FOUND");
  });
});
