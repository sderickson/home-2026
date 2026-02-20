import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

const adminUserId = "11111111-1111-1111-1111-111111111111";

describe("DELETE /recipes/:id", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 204 when admin deletes existing recipe", async () => {
    const createRes = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send({
        title: "To Delete",
        shortDescription: "Short",
        isPublic: true,
        initialVersion: {
          content: { ingredients: [], instructionsMarkdown: "" },
        },
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(createRes.status).toBe(200);
    const recipeId = createRes.body.recipe.id;

    const response = await request(app)
      .delete(`/recipes/${recipeId}`)
      .set(makeAdminHeaders(adminUserId));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).delete(
      "/recipes/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin requests delete", async () => {
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
      .delete(`/recipes/${recipeId}`)
      .set(makeUserHeaders());

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when recipe not found", async () => {
    const response = await request(app)
      .delete("/recipes/00000000-0000-0000-0000-000000000000")
      .set(makeAdminHeaders(adminUserId));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
