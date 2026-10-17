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
const SEED_USER_EMAIL = "members-list@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "viewer@example.com";

describe("GET /collections/:id/members", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with members when authenticated and caller is creator", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "solo",
        name: "Solo",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const response = await request(app)
      .get("/collections/solo/members")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body.members).toHaveLength(1);
    expect(response.body.members[0]).toMatchObject({
      collectionId: "solo",
      email: SEED_USER_EMAIL,
      role: "owner",
      isCreator: true,
    });
    expect(response.body.members[0].id).toEqual(expect.any(String));
    expect(response.body.members[0].createdAt).toEqual(expect.any(String));
  });

  it("should return 200 with all members when authenticated and caller is non-creator member", async () => {
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
      .get("/collections/shared/members")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body.members).toHaveLength(2);
    const emails = response.body.members.map((m: { email: string }) => m.email);
    expect(emails).toContain(SEED_USER_EMAIL);
    expect(emails).toContain(OTHER_USER_EMAIL);
    const creator = response.body.members.find(
      (m: { isCreator: boolean }) => m.isCreator,
    );
    expect(creator).toBeDefined();
    expect(creator.email).toBe(SEED_USER_EMAIL);
    expect(creator.role).toBe("owner");
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

    const response = await request(app).get("/collections/private/members");

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
      .get("/collections/other-collection/members")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 403 when collection does not exist (caller is not a member)", async () => {
    const response = await request(app)
      .get("/collections/non-existent-id/members")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
