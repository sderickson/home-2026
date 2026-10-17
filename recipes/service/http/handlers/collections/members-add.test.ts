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
const SEED_USER_EMAIL = "members-add@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "editor@example.com";
const NEW_MEMBER_EMAIL = "newmember@example.com";

describe("POST /collections/:id/members", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with member when owner adds new member", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "to-add",
        name: "To Add",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const body = {
      email: NEW_MEMBER_EMAIL,
      role: "editor",
    } satisfies RecipesServiceRequestBody["membersAddCollections"];

    const response = await request(app)
      .post("/collections/to-add/members")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      member: {
        collectionId: "to-add",
        email: NEW_MEMBER_EMAIL,
        role: "editor",
        isCreator: false,
        id: expect.any(String),
        createdAt: expect.any(String),
      },
    });
  });

  it("should return 200 with updated member when owner adds existing email (upsert role)", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "upsert",
        name: "Upsert",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const { error: addError } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "upsert",
        email: OTHER_USER_EMAIL,
        role: "viewer",
      },
    );
    expect(addError).toBeUndefined();

    const body = {
      email: OTHER_USER_EMAIL,
      role: "editor",
    } satisfies RecipesServiceRequestBody["membersAddCollections"];

    const response = await request(app)
      .post("/collections/upsert/members")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      member: {
        collectionId: "upsert",
        email: OTHER_USER_EMAIL,
        role: "editor",
        isCreator: false,
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
      .post("/collections/private/members")
      .send({
        email: NEW_MEMBER_EMAIL,
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersAddCollections"]);

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
      .post("/collections/other-collection/members")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL))
      .send({
        email: NEW_MEMBER_EMAIL,
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersAddCollections"]);

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
      .post("/collections/shared/members")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL))
      .send({
        email: NEW_MEMBER_EMAIL,
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersAddCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 403 when collection does not exist (caller is not a member)", async () => {
    const response = await request(app)
      .post("/collections/non-existent-id/members")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send({
        email: NEW_MEMBER_EMAIL,
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersAddCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
