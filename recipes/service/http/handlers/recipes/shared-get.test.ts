// Required for downloadUrl to be a valid full URI (recipes API base from env).
if (!process.env.PROTOCOL) process.env.PROTOCOL = "http";
if (!process.env.DOMAIN) process.env.DOMAIN = "docker.localhost";

import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import {
  recipeFileQueries,
  recipeQueries,
} from "@sderickson/recipes-db";
import { getRecipesApiBaseUrl } from "@sderickson/recipes-service-common";
import {
  acquireRouterSlimRouteTest,
  releaseSlimRouteTest,
  type SlimRouteTestContext,
} from "#test/slim-route-test.ts";
import { createRecipesShareRouter } from "./index.ts";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("sharedGetRecipes", () => {
  let ctx: SlimRouteTestContext;
  let recipeId: string;
  let fileId: string;

  beforeAll(async () => {
    ctx = acquireRouterSlimRouteTest(createRecipesShareRouter);

    const collectionId = await createTestCollection(ctx.dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(ctx.dbKey, {
      collectionId,
      title: "Shared Recipe",
      subtitle: "Public view",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
        instructionsMarkdown: "Stir well.",
      },
    });
    if (!result) {
      throw new Error("Expected createWithVersionRecipe to return result");
    }
    recipeId = result.recipe.id;

    const fileOut = await recipeFileQueries.insertRecipeFile(ctx.dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/photo.jpg`,
      file_original_name: "photo.jpg",
      mimetype: "image/jpeg",
      size: 2048,
      uploaded_by: SEED_USER_ID,
      unsplash_user: {
        name: "Ada Lovelace",
        links: { html: "https://unsplash.com/@ada" },
      },
    });
    if (!fileOut.result) {
      throw new Error("Expected insertRecipeFile to return result");
    }
    fileId = fileOut.result.id;
  });

  afterAll(() => {
    releaseSlimRouteTest(ctx.lease);
  });

  it("should return 200 with recipe, currentVersion, and shared file downloadUrls", async () => {
    const response = await request(ctx.app).get(`/recipes/${recipeId}/shared`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipe: {
        id: recipeId,
        title: "Shared Recipe",
        subtitle: "Public view",
        createdBy: SEED_USER_ID,
        currentVersionId: expect.any(String),
      },
      currentVersion: {
        recipeId,
        isLatest: true,
        content: {
          ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
          instructionsMarkdown: "Stir well.",
        },
      },
      files: [
        {
          id: fileId,
          recipeId,
          blobName: `recipes/${recipeId}/photo.jpg`,
          fileOriginalName: "photo.jpg",
          mimetype: "image/jpeg",
          size: 2048,
          downloadUrl: `${getRecipesApiBaseUrl()}/recipes/${recipeId}/shared/files/${fileId}/blob`,
          unsplashAttribution: {
            photographerName: "Ada Lovelace",
            photographerProfileUrl: expect.stringContaining(
              "https://unsplash.com/@ada",
            ),
            unsplashSourceUrl: expect.stringContaining("https://unsplash.com"),
          },
        },
      ],
    });
    expect(response.body.files[0].downloadUrl).toContain(
      `/recipes/${recipeId}/shared/files/${fileId}/blob`,
    );
    expect(response.body.files[0].downloadUrl).not.toMatch(
      new RegExp(`/recipes/${recipeId}/files/`),
    );
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(ctx.app).get(
      "/recipes/00000000-0000-0000-0000-000000000001/shared",
    );

    expect(response.status).toBe(404);
  });
});
