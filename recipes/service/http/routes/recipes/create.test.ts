import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

const adminUserId = "11111111-1111-1111-1111-111111111111";

describe("POST /recipes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 with recipe and initialVersion when admin and initialVersion supplied", async () => {
    const body = {
      title: "New Recipe",
      shortDescription: "A short description",
      isPublic: true,
      initialVersion: {
        content: {
          ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
          instructionsMarkdown: "Mix and bake.",
        },
      },
    } satisfies RecipesServiceRequestBody["createRecipe"];

    const response = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipe: {
        title: body.title,
        shortDescription: body.shortDescription,
        isPublic: true,
        id: expect.any(String),
        createdBy: adminUserId,
        updatedBy: adminUserId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        currentVersionId: expect.any(String),
      },
      initialVersion: {
        recipeId: response.body.recipe.id,
        isLatest: true,
        content: body.initialVersion.content,
        id: expect.any(String),
        createdBy: adminUserId,
        createdAt: expect.any(String),
      },
    });
  });

  it("should return 200 with recipe only when admin and no initialVersion", async () => {
    const body = {
      title: "Recipe Without Version",
      shortDescription: "Short",
      isPublic: false,
    } satisfies RecipesServiceRequestBody["createRecipe"];

    const response = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(adminUserId))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipe: {
        title: body.title,
        shortDescription: body.shortDescription,
        isPublic: false,
        id: expect.any(String),
        createdBy: adminUserId,
        updatedBy: adminUserId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
    expect(response.body.initialVersion).toBeUndefined();
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post("/recipes")
      .send({
        title: "Test",
        shortDescription: "Short",
        isPublic: true,
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when non-admin", async () => {
    const response = await request(app)
      .post("/recipes")
      .set(makeUserHeaders())
      .send({
        title: "Test",
        shortDescription: "Short",
        isPublic: true,
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
