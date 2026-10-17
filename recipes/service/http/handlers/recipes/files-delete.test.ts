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

describe("DELETE /recipes/:id/files/:fileId (filesDeleteRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;
  let fileId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
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
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;

    const insertFile = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/test-file.pdf`,
      file_original_name: "test.pdf",
      mimetype: "application/pdf",
      size: 100,
      uploaded_by: SEED_USER_ID,
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
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

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

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .delete(`/recipes/${recipeId}/files/${fileId}`)
      .set(makeUserHeaders("other-user-id", "other@example.com"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when file not found", async () => {
    const response = await request(app)
      .delete(
        `/recipes/${recipeId}/files/00000000-0000-0000-0000-000000000001`,
      )
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });

  it("should return 404 when file belongs to different recipe", async () => {
    const { result: otherRecipe } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Other Recipe",
        subtitle: "Other",
        description: null,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    if (!otherRecipe) throw new Error("Expected createWithVersionRecipe to return result");
    const otherRecipeId = otherRecipe.recipe.id;

    const response = await request(app)
      .delete(`/recipes/${otherRecipeId}/files/${fileId}`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });
});
