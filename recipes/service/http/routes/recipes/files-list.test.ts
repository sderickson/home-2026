import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";

describe("GET /recipes/:id/files (filesListRecipes)", () => {
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

  it("should return 200 with empty array when recipe has no files", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it("should return 200 with files when recipe has files", async () => {
    const { result: file } = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: "recipes/recipe-id/file-id.pdf",
      file_original_name: "recipe.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploaded_by: seedUserId,
    });
    if (!file) throw new Error("Expected insertRecipeFile to return result");

    const response = await request(app)
      .get(`/recipes/${recipeId}/files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: file.id,
      recipeId,
      blobName: "recipes/recipe-id/file-id.pdf",
      fileOriginalName: "recipe.pdf",
      mimetype: "application/pdf",
      size: 1024,
      uploadedBy: seedUserId,
    });
    expect(response.body[0].createdAt).toBeDefined();
    expect(response.body[0].updatedAt).toBeDefined();
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get("/recipes/00000000-0000-0000-0000-000000000001/files")
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
      .get(`/recipes/${privateId}/files`)
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
  });
});
