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

describe("POST /recipes/:id/versions", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 with new version when admin sends content body", async () => {
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

    const versionContent = {
      ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
      instructionsMarkdown: "# Step 1\nMix.\n\n# Step 2\nBake.",
    } satisfies RecipesServiceRequestBody["createRecipeVersion"];

    const response = await request(app)
      .post(`/recipes/${recipeId}/versions`)
      .set(makeAdminHeaders(adminUserId))
      .send(versionContent);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipeId,
      content: versionContent,
      isLatest: true,
      createdBy: adminUserId,
      id: expect.any(String),
      createdAt: expect.any(String),
    } satisfies Partial<RecipesServiceResponseBody["createRecipeVersion"][200]>);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post("/recipes/00000000-0000-0000-0000-000000000000/versions")
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["createRecipeVersion"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin requests create version", async () => {
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
      .post(`/recipes/${recipeId}/versions`)
      .set(makeUserHeaders())
      .send({
        ingredients: [],
        instructionsMarkdown: "New version",
      } satisfies RecipesServiceRequestBody["createRecipeVersion"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .post(`/recipes/${fakeId}/versions`)
      .set(makeAdminHeaders(adminUserId))
      .send({
        ingredients: [],
        instructionsMarkdown: "",
      } satisfies RecipesServiceRequestBody["createRecipeVersion"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
