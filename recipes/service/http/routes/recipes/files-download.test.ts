import { Readable } from "stream";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { createObjectStore } from "@saflib/object-store";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  recipeQueries,
  recipeFileQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes/:id/files/:fileId/blob (filesDownloadRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;
  let fileId: string;
  let container: ReturnType<typeof createObjectStore>;

  beforeEach(async () => {
    container = createObjectStore({ type: "test" });
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Test Recipe",
      subtitle: "Short",
      description: null,
      isPublic: true,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "Mix.",
      },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;

    const insertOut = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/test-blob.pdf`,
      file_original_name: "test-doc.pdf",
      mimetype: "application/pdf",
      size: 13,
      uploaded_by: SEED_USER_ID,
    });
    if (!insertOut.result) throw new Error("Expected insertRecipeFile to return result");
    fileId = insertOut.result.id;

    const uploadResult = await container.uploadFile(
      insertOut.result.blob_name,
      Readable.from(Buffer.from("binary content")),
      { mimetype: "application/pdf", filename: "test-doc.pdf" },
    );
    if (uploadResult.error) throw uploadResult.error;

    app = createRecipesHttpApp({
      recipesDbKey: dbKey,
      recipesFileContainer: container,
    });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with file binary and correct headers when user requests public recipe file", async () => {
    const response = await request(app)
      .get(`/recipes/${recipeId}/files/${fileId}/blob`)
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("application/pdf");
    expect(response.headers["content-disposition"]).toContain("inline");
    expect(response.headers["content-disposition"]).toContain("test-doc.pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.toString()).toBe("binary content");
  });

  it("should return 200 when admin downloads file from private recipe", async () => {
    const { result: privateResult } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Private Recipe",
        subtitle: "Private",
        description: null,
        isPublic: false,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    if (!privateResult) throw new Error("Expected createWithVersionRecipe to return result");
    const privateRecipeId = privateResult.recipe.id;
    const privFile = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: privateRecipeId,
      blob_name: `recipes/${privateRecipeId}/priv.pdf`,
      file_original_name: "priv.pdf",
      mimetype: "application/pdf",
      size: 0,
      uploaded_by: SEED_USER_ID,
    });
    if (!privFile.result) throw new Error("Expected insertRecipeFile to return result");
    const uploadPriv = await container.uploadFile(
      privFile.result.blob_name,
      Readable.from(Buffer.from("")),
      {},
    );
    if (uploadPriv.error) throw uploadPriv.error;

    const response = await request(app)
      .get(`/recipes/${privateRecipeId}/files/${privFile.result.id}/blob`)
      .set(makeAdminHeaders(SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("application/pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).get(
      `/recipes/${recipeId}/files/${fileId}/blob`,
    );

    expect(response.status).toBe(401);
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/00000000-0000-0000-0000-000000000001/files/${fileId}/blob`,
      )
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });

  it("should return 404 when file not found", async () => {
    const response = await request(app)
      .get(
        `/recipes/${recipeId}/files/00000000-0000-0000-0000-000000000001/blob`,
      )
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_FILE_NOT_FOUND");
  });

  it("should return 404 when recipe is private and user is not admin", async () => {
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "Private Recipe",
      subtitle: "Private",
      description: null,
      isPublic: false,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    const privateRecipeId = result.recipe.id;
    const privFile = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: privateRecipeId,
      blob_name: `recipes/${privateRecipeId}/priv.pdf`,
      file_original_name: "priv.pdf",
      mimetype: "application/pdf",
      size: 0,
      uploaded_by: SEED_USER_ID,
    });
    if (!privFile.result) throw new Error("Expected insertRecipeFile to return result");
    const uploadPriv = await container.uploadFile(
      privFile.result.blob_name,
      Readable.from(Buffer.from("")),
      {},
    );
    if (uploadPriv.error) throw uploadPriv.error;

    const response = await request(app)
      .get(`/recipes/${privateRecipeId}/files/${privFile.result.id}/blob`)
      .set(makeUserHeaders());

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
