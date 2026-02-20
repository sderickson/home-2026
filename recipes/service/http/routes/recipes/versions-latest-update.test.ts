import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";

const adminUserId = "11111111-1111-1111-1111-111111111111";

describe("PUT /recipes/:id/versions/latest", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 with updated version when admin sends content body", async () => {
    const createRes = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send({
        title: "Recipe",
        shortDescription: "Short",
        isPublic: false,
        initialVersion: {
          content: {
            ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
            instructionsMarkdown: "# Step 1\nMix.",
          },
        },
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(createRes.status).toBe(200);
    const recipeId = createRes.body.recipe.id;
    const versionId = createRes.body.initialVersion.id;

    const updateBody = {
      ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
      instructionsMarkdown: "# Step 1\nMix.\n\n# Step 2\nBake.",
    } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"];

    const response = await request(app)
      .put(`/recipes/${recipeId}/versions/latest`)
      .set(makeAdminHeaders(adminUserId))
      .send(updateBody);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: versionId,
      recipeId,
      content: updateBody,
      isLatest: true,
      createdBy: adminUserId,
      createdAt: expect.any(String),
    } satisfies Partial<RecipesServiceResponseBody["updateRecipeVersionLatest"][200]>);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .put("/recipes/00000000-0000-0000-0000-000000000000/versions/latest")
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin requests update", async () => {
    const createRes = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send({
        title: "Recipe",
        shortDescription: "Short",
        isPublic: true,
        initialVersion: {
          content: { ingredients: [], instructionsMarkdown: "" },
        },
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(createRes.status).toBe(200);
    const recipeId = createRes.body.recipe.id;

    const response = await request(app)
      .put(`/recipes/${recipeId}/versions/latest`)
      .set(makeUserHeaders())
      .send({
        ingredients: [],
        instructionsMarkdown: "Hacked",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .put(`/recipes/${fakeId}/versions/latest`)
      .set(makeAdminHeaders(adminUserId))
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_VERSION_NOT_FOUND");
  });

  it("should return 404 when recipe has no versions", async () => {
    const createRes = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send({
        title: "Recipe",
        shortDescription: "Short",
        isPublic: false,
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(createRes.status).toBe(200);
    const recipeId = createRes.body.recipe.id;
    expect(createRes.body.initialVersion).toBeUndefined();

    const response = await request(app)
      .put(`/recipes/${recipeId}/versions/latest`)
      .set(makeAdminHeaders(adminUserId))
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["updateRecipeVersionLatest"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_VERSION_NOT_FOUND");
  });
});
