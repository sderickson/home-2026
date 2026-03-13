import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("GET /recipes", () => {
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

  it("should return 400 when collectionId query parameter is missing", async () => {
    const response = await request(app)
      .get("/recipes")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("collectionId");
  });

  it("should return 200 and empty array when no recipes exist", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should return 401 or 500 when not authenticated (no auth context)", async () => {
    const response = await request(app)
      .get("/recipes")
      .query({ collectionId });

    expect([401, 500]).toContain(response.status);
  });
});
