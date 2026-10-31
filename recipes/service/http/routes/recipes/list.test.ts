import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../test/http-app.ts";
import { makeUserHeaders } from "@saflib/express";
import {
  recipeFileQueries,
  recipeQueries,
  recipesDb,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes", () => {
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

  it("should return 400 when collectionId is not provided", async () => {
    const response = await request(app)
      .get("/recipes")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("collectionId");
  });

  it("should return 200 and empty recipes list when no recipes exist", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      recipes: [],
      currentVersions: [],
      files: [],
    });
  });

  it("should include current versions and files for listed recipes", async () => {
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Pancakes",
      subtitle: "Fluffy",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and cook.",
      },
    });
    if (!result)
      throw new Error("Expected createWithVersionRecipe to return result");
    const recipeId = result.recipe.id;
    const { result: file } = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/photo.jpg`,
      file_original_name: "photo.jpg",
      mimetype: "image/jpeg",
      size: 1024,
      uploaded_by: SEED_USER_ID,
    });
    if (!file) throw new Error("Expected insertRecipeFile to return result");

    const response = await request(app)
      .get("/recipes")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.recipes).toHaveLength(1);
    expect(response.body.recipes[0].currentVersionId).toBe(
      result.version.id,
    );
    expect(response.body.currentVersions).toHaveLength(1);
    expect(response.body.currentVersions[0]).toMatchObject({
      recipeId,
      content: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
      },
    });
    expect(response.body.files).toHaveLength(1);
    expect(response.body.files[0]).toMatchObject({
      id: file.id,
      recipeId,
      downloadUrl: expect.stringContaining(
        `/recipes/${recipeId}/files/${file.id}/blob`,
      ),
    });
  });

  it("should return 401 or 500 when not authenticated (no auth context)", async () => {
    const response = await request(app).get("/recipes").query({ collectionId });

    expect(response.status).toBe(401);
  });

  it("should return 422 when collection does not exist", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId: "00000000-0000-0000-0000-000000000001" })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("COLLECTION_NOT_FOUND");
  });
});
