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

describe("POST /recipes/:id/files (filesUploadRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

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
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with file metadata when admin uploads file", async () => {
    const fileContent = "recipe notes content";
    const filename = "notes.txt";

    const response = await request(app)
      .post(`/recipes/${recipeId}/files`)
      .set(makeAdminHeaders(adminUserId))
      .attach("file", Buffer.from(fileContent), filename);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipeId,
      fileOriginalName: filename,
      mimetype: "text/plain",
      size: fileContent.length,
      uploadedBy: adminUserId,
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.blobName).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();

    const listOut = await recipeFileQueries.listRecipeFile(dbKey, {
      recipeId,
    });
    expect(listOut.result).toHaveLength(1);
    expect(listOut.result![0].id).toBe(response.body.id);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files`)
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files`)
      .set(makeUserHeaders())
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .post("/recipes/00000000-0000-0000-0000-000000000001/files")
      .set(makeAdminHeaders(adminUserId))
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
