import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { collectionQueries } from "@sderickson/recipes-db";

const SEED_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_EMAIL = "list-collections@example.com";

describe("GET /collections", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with empty collections when authenticated and no memberships", async () => {
    const response = await request(app)
      .get("/collections")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ collections: [], members: [] });
  });

  it("should return 200 with collections when authenticated and user is member", async () => {
    const { result: created, error: createError } =
      await collectionQueries.createCollection(dbKey, {
        id: "my-kitchen",
        name: "My Kitchen",
        creatorEmail: SEED_USER_EMAIL,
      });
    expect(createError).toBeUndefined();
    expect(created).toBeDefined();

    const response = await request(app)
      .get("/collections")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body.collections).toHaveLength(1);
    expect(response.body.collections[0]).toMatchObject({
      id: "my-kitchen",
      name: "My Kitchen",
      createdBy: SEED_USER_EMAIL,
    });
    expect(response.body.collections[0].createdAt).toEqual(expect.any(String));
    expect(response.body.collections[0].updatedAt).toEqual(expect.any(String));
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).get("/collections");

    expect(response.status).toBe(401);
  });
});
