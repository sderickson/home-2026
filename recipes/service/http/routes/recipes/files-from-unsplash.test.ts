import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../test/http-app.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("POST /recipes/:id/files/from-unsplash (filesFromUnsplashRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Test Recipe",
      subtitle: "Short",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
    });
    if (!result)
      throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with file metadata and unsplashAttribution when admin sends valid body", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files/from-unsplash`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        unsplashPhotoId: "mock-photo-id",
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      file: {
        recipeId,
        fileOriginalName: "unsplash-mock-photo-id.jpg",
        mimetype: "image/jpeg",
        uploadedBy: SEED_USER_ID,
        unsplashAttribution: {
          photographerName: "Mock Photographer",
          photographerProfileUrl: expect.stringContaining(
            "unsplash.com/@mockphotographer",
          ),
          unsplashSourceUrl: expect.stringContaining("unsplash.com"),
        },
      },
    });
    expect(response.body.file.unsplashAttribution.photographerProfileUrl).toMatch(
      /utm_source=893198&utm_medium=referral/,
    );
    expect(response.body.file.unsplashAttribution.unsplashSourceUrl).toMatch(
      /utm_source=893198&utm_medium=referral/,
    );
    expect(response.body.file.id).toBeDefined();
    // Hotlinked, not stored: no blob, and downloadUrl points at Unsplash.
    expect(response.body.file.blobName).toBe("");
    expect(response.body.file.size).toBe(0);
    expect(response.body.file.downloadUrl).toMatch(
      /^https:\/\/images\.unsplash\.com\/photo-mock-raw\?.*w=1600/,
    );
    expect(response.body.file.createdAt).toBeDefined();
    expect(response.body.file.updatedAt).toBeDefined();

    const listOut = await recipeFileQueries.listRecipeFile(dbKey, {
      recipeId,
    });
    expect(listOut.result).toHaveLength(1);
    expect(listOut.result![0].id).toBe(response.body.file.id);
    expect(listOut.result![0].unsplash_user).not.toBeNull();
    expect(listOut.result![0].unsplash_image_url).toBe(
      "https://images.unsplash.com/photo-mock-raw",
    );
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files/from-unsplash`)
      .send({
        unsplashPhotoId: "mock-photo-id",
      });

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files/from-unsplash`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .send({
        unsplashPhotoId: "mock-photo-id",
      });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .post("/recipes/nonexistent-recipe-id/files/from-unsplash")
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        unsplashPhotoId: "mock-photo-id",
      });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
