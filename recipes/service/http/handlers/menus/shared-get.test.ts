// Required for downloadUrl to be a valid full URI (recipes API base from env).
if (!process.env.PROTOCOL) process.env.PROTOCOL = "http";
if (!process.env.DOMAIN) process.env.DOMAIN = "docker.localhost";

import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import {
  menuQueries,
  recipeFileQueries,
  recipeQueries,
} from "@sderickson/recipes-db";
import { getRecipesApiBaseUrl } from "@sderickson/recipes-service-common";
import {
  acquireRouterSlimRouteTest,
  releaseSlimRouteTest,
  type SlimRouteTestContext,
} from "#test/slim-route-test.ts";
import { createMenusShareRouter } from "./index.ts";
import {
  createTestCollection,
  SEED_USER_ID,
} from "../../routes/recipes/_test-helpers.ts";

describe("sharedGetMenus", () => {
  let ctx: SlimRouteTestContext;
  let menuId: string;
  let soupId: string;
  let breadId: string;
  let fileId: string;

  beforeAll(async () => {
    ctx = acquireRouterSlimRouteTest(createMenusShareRouter);
    const collectionId = await createTestCollection(ctx.dbKey);

    async function createRecipe(title: string) {
      const { result } = await recipeQueries.createWithVersionRecipe(
        ctx.dbKey,
        {
          collectionId,
          title,
          subtitle: "",
          description: null,
          createdBy: SEED_USER_ID,
          updatedBy: SEED_USER_ID,
          versionContent: {
            ingredients: [{ name: "Leeks", quantity: "2", unit: "" }],
            instructionsMarkdown: "Simmer.",
          },
        },
      );
      if (!result) throw new Error("Expected createWithVersionRecipe result");
      return result.recipe.id;
    }
    soupId = await createRecipe("Leek Soup");
    breadId = await createRecipe("Bread");

    const fileOut = await recipeFileQueries.insertRecipeFile(ctx.dbKey, {
      recipe_id: soupId,
      blob_name: `recipes/${soupId}/photo.jpg`,
      file_original_name: "photo.jpg",
      mimetype: "image/jpeg",
      size: 2048,
      uploaded_by: SEED_USER_ID,
      unsplash_user: null,
    });
    if (!fileOut.result) throw new Error("Expected insertRecipeFile result");
    fileId = fileOut.result.id;

    const menuOut = await menuQueries.createMenu(ctx.dbKey, {
      collectionId,
      name: "Supper",
      createdBy: SEED_USER_ID,
      groupings: [
        // Includes an id that no longer exists; it should be dropped.
        { name: "Soups", recipeIds: [soupId, "deleted-recipe-id"] },
        { name: "Sides", recipeIds: [breadId] },
      ],
    });
    if (!menuOut.result) throw new Error("Expected createMenu result");
    menuId = menuOut.result.id;
  });

  afterAll(() => {
    releaseSlimRouteTest(ctx.lease);
  });

  it("returns the menu, its recipes, current versions, and shared file URLs", async () => {
    const response = await request(ctx.app).get(`/menus/${menuId}/shared`);

    expect(response.status).toBe(200);
    expect(response.body.menu).toMatchObject({
      id: menuId,
      name: "Supper",
      groupings: [
        { name: "Soups", recipeIds: [soupId] },
        { name: "Sides", recipeIds: [breadId] },
      ],
    });
    expect(response.body.recipes.map((r: { id: string }) => r.id)).toEqual([
      soupId,
      breadId,
    ]);
    expect(
      response.body.currentVersions.map((v: { recipeId: string }) => v.recipeId),
    ).toEqual([soupId, breadId]);
    expect(response.body.currentVersions[0].content.ingredients).toEqual([
      { name: "Leeks", quantity: "2", unit: "" },
    ]);
    expect(response.body.files).toEqual([
      expect.objectContaining({
        id: fileId,
        recipeId: soupId,
        downloadUrl: `${getRecipesApiBaseUrl()}/recipes/${soupId}/shared/files/${fileId}/blob`,
      }),
    ]);
  });

  it("returns 404 when the menu does not exist", async () => {
    const response = await request(ctx.app).get("/menus/no-such-menu/shared");
    expect(response.status).toBe(404);
  });
});
