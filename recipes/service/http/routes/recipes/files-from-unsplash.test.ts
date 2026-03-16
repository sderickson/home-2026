import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

/** Minimal valid JPEG (1x1) as data URL so fetch works without network. */
const minimalJpegDataUrl =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP8A";

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
        downloadLocation:
          "https://api.unsplash.com/photos/mock-photo-id/download",
        imageUrl: minimalJpegDataUrl,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
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
    });
    expect(response.body.unsplashAttribution.photographerProfileUrl).toMatch(
      /utm_source=893198&utm_medium=referral/,
    );
    expect(response.body.unsplashAttribution.unsplashSourceUrl).toMatch(
      /utm_source=893198&utm_medium=referral/,
    );
    expect(response.body.id).toBeDefined();
    expect(response.body.blobName).toBeDefined();
    expect(response.body.size).toBeGreaterThan(0);
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();

    const listOut = await recipeFileQueries.listRecipeFile(dbKey, {
      recipeId,
    });
    expect(listOut.result).toHaveLength(1);
    expect(listOut.result![0].id).toBe(response.body.id);
    expect(listOut.result![0].unsplash_user).not.toBeNull();
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files/from-unsplash`)
      .send({
        unsplashPhotoId: "mock-photo-id",
        downloadLocation:
          "https://api.unsplash.com/photos/mock-photo-id/download",
        imageUrl: minimalJpegDataUrl,
      });

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files/from-unsplash`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .send({
        unsplashPhotoId: "mock-photo-id",
        downloadLocation:
          "https://api.unsplash.com/photos/mock-photo-id/download",
        imageUrl: minimalJpegDataUrl,
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
        downloadLocation:
          "https://api.unsplash.com/photos/mock-photo-id/download",
        imageUrl: minimalJpegDataUrl,
      });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
