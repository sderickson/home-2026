import { Readable } from "stream";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import {
  recipeFileQueries,
  recipeQueries,
} from "@sderickson/recipes-db";
import { getDefaultRecipesFileContainer } from "@sderickson/recipes-service-common";
import {
  acquireRouterSlimRouteTest,
  releaseSlimRouteTest,
  type SlimRouteTestContext,
} from "#test/slim-route-test.ts";
import { createRecipesRouter } from "./index.ts";
import { createTestCollection, SEED_USER_ID } from "../../routes/recipes/_test-helpers.ts";

describe("sharedFilesDownloadRecipes", () => {
  let ctx: SlimRouteTestContext;
  let recipeId: string;
  let otherRecipeId: string;
  let fileId: string;

  beforeAll(async () => {
    ctx = acquireRouterSlimRouteTest(createRecipesRouter);

    const collectionId = await createTestCollection(ctx.dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(ctx.dbKey, {
      collectionId,
      title: "Shared Recipe",
      subtitle: "Public view",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "Mix.",
      },
    });
    if (!result) {
      throw new Error("Expected createWithVersionRecipe to return result");
    }
    recipeId = result.recipe.id;

    const otherOut = await recipeQueries.createWithVersionRecipe(ctx.dbKey, {
      collectionId,
      title: "Other Recipe",
      subtitle: "Other",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "",
      },
    });
    if (!otherOut.result) {
      throw new Error("Expected createWithVersionRecipe to return result");
    }
    otherRecipeId = otherOut.result.recipe.id;

    const fileOut = await recipeFileQueries.insertRecipeFile(ctx.dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/photo.jpg`,
      file_original_name: "photo.jpg",
      mimetype: "image/jpeg",
      size: 14,
      uploaded_by: SEED_USER_ID,
    });
    if (!fileOut.result) {
      throw new Error("Expected insertRecipeFile to return result");
    }
    fileId = fileOut.result.id;

    const container = getDefaultRecipesFileContainer();
    const uploadResult = await container.uploadFile(
      fileOut.result.blob_name,
      Readable.from(Buffer.from("shared content")),
      { mimetype: "image/jpeg", filename: "photo.jpg" },
    );
    if (uploadResult.error) throw uploadResult.error;
  });

  afterAll(() => {
    releaseSlimRouteTest(ctx.lease);
  });

  it("should return 200 with file binary when unauthenticated", async () => {
    const response = await request(ctx.app).get(
      `/recipes/${recipeId}/shared/files/${fileId}/blob`,
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/jpeg");
    expect(response.headers["content-disposition"]).toContain("inline");
    expect(response.headers["content-disposition"]).toContain("photo.jpg");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.toString()).toBe("shared content");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(ctx.app).get(
      `/recipes/00000000-0000-0000-0000-000000000001/shared/files/${fileId}/blob`,
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when file not found", async () => {
    const response = await request(ctx.app).get(
      `/recipes/${recipeId}/shared/files/00000000-0000-0000-0000-000000000001/blob`,
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });

  it("should return 404 when file belongs to a different recipe", async () => {
    const response = await request(ctx.app).get(
      `/recipes/${otherRecipeId}/shared/files/${fileId}/blob`,
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });
});
