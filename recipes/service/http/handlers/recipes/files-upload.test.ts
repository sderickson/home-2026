import { recipesDb } from "@sderickson/recipes-db/instances";
import { listRecipeFile } from "@sderickson/recipes-db/queries/recipe-file/list";
import { createWithVersionRecipe } from "@sderickson/recipes-db/queries/recipe/create-with-version";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";

import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("POST /recipes/:id/files (filesUploadRecipes)", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    const collectionId = await createTestCollection(dbKey);
    const { result } = await createWithVersionRecipe(dbKey, {
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
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .attach("file", Buffer.from(fileContent), filename);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      file: {
        recipeId,
        fileOriginalName: filename,
        mimetype: "text/plain",
        size: fileContent.length,
        uploadedBy: SEED_USER_ID,
      },
    });
    expect(response.body.file.id).toBeDefined();
    expect(response.body.file.blobName).toBeDefined();
    expect(response.body.file.createdAt).toBeDefined();
    expect(response.body.file.updatedAt).toBeDefined();

    const listOut = await listRecipeFile(dbKey, {
      recipeId,
    });
    expect(listOut.result).toHaveLength(1);
    expect(listOut.result![0].id).toBe(response.body.file.id);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files`)
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .post(`/recipes/${recipeId}/files`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .post("/recipes/00000000-0000-0000-0000-000000000001/files")
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .attach("file", Buffer.from("content"), "file.txt");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
