import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("POST /recipes", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with recipe and initialVersion when admin and initialVersion supplied", async () => {
    const body = {
      collectionId,
      title: "New Recipe",
      subtitle: "A short description",
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
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipe: {
        title: body.title,
        subtitle: body.subtitle,
        isPublic: true,
        id: expect.any(String),
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        currentVersionId: expect.any(String),
      },
      initialVersion: {
        recipeId: response.body.recipe.id,
        isLatest: true,
        content: body.initialVersion.content,
        id: expect.any(String),
        createdBy: SEED_USER_ID,
        createdAt: expect.any(String),
      },
    });
  });

  it("should return 200 with recipe only when admin and no initialVersion", async () => {
    const body = {
      collectionId,
      title: "Recipe Without Version",
      subtitle: "Short",
      isPublic: false,
    } satisfies RecipesServiceRequestBody["createRecipe"];

    const response = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipe: {
        title: body.title,
        subtitle: body.subtitle,
        isPublic: false,
        id: expect.any(String),
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
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
        collectionId,
        title: "Test",
        subtitle: "Short",
        isPublic: true,
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner (e.g. non-member)", async () => {
    const response = await request(app)
      .post("/recipes")
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .send({
        collectionId,
        title: "Test",
        subtitle: "Short",
        isPublic: true,
      } satisfies RecipesServiceRequestBody["createRecipe"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 400 when collectionId is missing in request body", async () => {
    const response = await request(app)
      .post("/recipes")
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        title: "Test",
        subtitle: "Short",
        isPublic: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("collectionId");
  });
});
