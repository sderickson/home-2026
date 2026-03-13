import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import {
  collectionMemberQueries,
  collectionQueries,
} from "@sderickson/recipes-db";

const SEED_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_EMAIL = "get-collections@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "viewer@example.com";

describe("GET /collections/:id", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with collection when authenticated and caller is creator", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "my-kitchen",
        name: "My Kitchen",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const response = await request(app)
      .get("/collections/my-kitchen")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      collection: {
        id: "my-kitchen",
        name: "My Kitchen",
        createdBy: SEED_USER_EMAIL,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it("should return 200 with collection when authenticated and caller is non-creator member", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "shared",
        name: "Shared",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const { error: addError } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "shared",
        email: OTHER_USER_EMAIL,
        role: "viewer",
      },
    );
    expect(addError).toBeUndefined();

    const response = await request(app)
      .get("/collections/shared")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      collection: {
        id: "shared",
        name: "Shared",
        createdBy: SEED_USER_EMAIL,
      },
    });
  });

  it("should return 401 when not authenticated", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "private",
        name: "Private",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const response = await request(app).get("/collections/private");

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not a member", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "other-collection",
        name: "Other",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const response = await request(app)
      .get("/collections/other-collection")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when collection does not exist", async () => {
    const response = await request(app)
      .get("/collections/non-existent-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });
});
