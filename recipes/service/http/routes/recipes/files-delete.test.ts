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

const adminUserId = "11111111-1111-1111-1111-111111111111";

describe("DELETE /recipes/:id/files/:fileId (filesDeleteRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;
  let fileId: string;

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

    const insertFile = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/test-file.pdf`,
      file_original_name: "test.pdf",
      mimetype: "application/pdf",
      size: 100,
      uploaded_by: adminUserId,
    });
    if (!insertFile.result) throw new Error("Expected insertRecipeFile to return result");
    fileId = insertFile.result.id;

    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 204 when admin deletes existing file", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/files/${fileId}`)
      .set(makeAdminHeaders(adminUserId));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const listOut = await recipeFileQueries.listRecipeFile(dbKey, {
      recipeId,
    });
    expect(listOut.result).toHaveLength(0);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).delete(
      `/recipes/${recipeId}/files/${fileId}`,
    );

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/files/${fileId}`)
      .set(makeUserHeaders());

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when file not found", async () => {
    const response = await request(app)
      .delete(
        `/recipes/${recipeId}/files/00000000-0000-0000-0000-000000000001`,
      )
      .set(makeAdminHeaders(adminUserId));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });

  it("should return 404 when file belongs to different recipe", async () => {
    const { result: otherRecipe } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        title: "Other Recipe",
        shortDescription: "Other",
        longDescription: null,
        isPublic: true,
        createdBy: adminUserId,
        updatedBy: adminUserId,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    if (!otherRecipe) throw new Error("Expected createWithVersionRecipe to return result");
    const otherRecipeId = otherRecipe.recipe.id;

    const response = await request(app)
      .delete(`/recipes/${otherRecipeId}/files/${fileId}`)
      .set(makeAdminHeaders(adminUserId));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });
});
