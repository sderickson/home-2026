import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

const adminUserId = "11111111-1111-1111-1111-111111111111";

describe("PUT /recipes/:id", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 with updated recipe when admin sends partial body", async () => {
    const createRes = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send({
        title: "Original Title",
        shortDescription: "Short",
        isPublic: false,
        initialVersion: {
          content: {
            ingredients: [],
            instructionsMarkdown: "",
          },
        },
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(createRes.status).toBe(200);
    const recipeId = createRes.body.recipe.id;

    const updateBody = {
      title: "Updated Title",
      isPublic: true,
    } satisfies RecipesServiceRequestBody["updateRecipe"];

    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set(makeAdminHeaders(adminUserId))
      .send(updateBody);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: recipeId,
      title: updateBody.title,
      shortDescription: "Short",
      isPublic: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("should return 401 when not authenticated", async () => {
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
      .put(`/recipes/${recipeId}`)
      .send({ title: "Updated" } satisfies RecipesServiceRequestBody["updateRecipe"]);

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
      .put(`/recipes/${recipeId}`)
      .set(makeUserHeaders())
      .send({ title: "Hacked" } satisfies RecipesServiceRequestBody["updateRecipe"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .put(`/recipes/${fakeId}`)
      .set(makeAdminHeaders(adminUserId))
      .send({
        title: "Updated",
      } satisfies RecipesServiceRequestBody["updateRecipe"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
