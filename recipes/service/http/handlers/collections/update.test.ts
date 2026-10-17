import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import {
  collectionMemberQueries,
  collectionQueries,
} from "@sderickson/recipes-db";

const SEED_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_EMAIL = "update-collections@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "editor@example.com";

describe("PUT /collections/:id", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with updated collection when caller is owner", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "to-rename",
        name: "Original Name",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const body = {
      name: "Updated Name",
    } satisfies RecipesServiceRequestBody["updateCollections"];

    const response = await request(app)
      .put("/collections/to-rename")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      collection: {
        id: "to-rename",
        name: "Updated Name",
        createdBy: SEED_USER_EMAIL,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
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

    const response = await request(app)
      .put("/collections/private")
      .send({
        name: "New Name",
      } satisfies RecipesServiceRequestBody["updateCollections"]);

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
      .put("/collections/other-collection")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL))
      .send({
        name: "Hacked",
      } satisfies RecipesServiceRequestBody["updateCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 403 when caller is member but not owner", async () => {
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
        role: "editor",
      },
    );
    expect(addError).toBeUndefined();

    const response = await request(app)
      .put("/collections/shared")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL))
      .send({
        name: "Editor Tried to Rename",
      } satisfies RecipesServiceRequestBody["updateCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 403 when collection does not exist (caller is not a member)", async () => {
    const response = await request(app)
      .put("/collections/non-existent-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send({
        name: "New Name",
      } satisfies RecipesServiceRequestBody["updateCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
