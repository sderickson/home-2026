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
const SEED_USER_EMAIL = "members-update@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "editor@example.com";

describe("PUT /collections/:id/members/:memberId", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with updated member when owner changes non-creator role", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "to-update",
        name: "To Update",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const { result: added } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "to-update",
        email: OTHER_USER_EMAIL,
        role: "editor",
      },
    );
    expect(added).toBeDefined();
    const memberId = added!.id;

    const body = {
      role: "viewer",
    } satisfies RecipesServiceRequestBody["membersUpdateCollections"];

    const response = await request(app)
      .put(`/collections/to-update/members/${memberId}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      member: {
        id: memberId,
        collectionId: "to-update",
        email: OTHER_USER_EMAIL,
        role: "viewer",
        isCreator: false,
        createdAt: expect.any(String),
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

    const { result: members } =
      await collectionMemberQueries.listCollectionMember(dbKey, {
        collectionId: "private",
      });
    expect(members).toBeDefined();
    const memberId = members![0].id;

    const response = await request(app)
      .put(`/collections/private/members/${memberId}`)
      .send({
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersUpdateCollections"]);

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

    const { result: members } =
      await collectionMemberQueries.listCollectionMember(dbKey, {
        collectionId: "other-collection",
      });
    expect(members).toBeDefined();
    const memberId = members![0].id;

    const response = await request(app)
      .put(`/collections/other-collection/members/${memberId}`)
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL))
      .send({
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersUpdateCollections"]);

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

    const { result: added } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "shared",
        email: OTHER_USER_EMAIL,
        role: "editor",
      },
    );
    expect(added).toBeDefined();

    const response = await request(app)
      .put(`/collections/shared/members/${added!.id}`)
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL))
      .send({
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersUpdateCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 404 when member does not exist in collection", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "exists",
        name: "Exists",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const response = await request(app)
      .put("/collections/exists/members/non-existent-member-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send({
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersUpdateCollections"]);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });

  it("should return 403 when collection does not exist (caller is not a member)", async () => {
    const response = await request(app)
      .put("/collections/non-existent-id/members/some-member-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send({
        role: "viewer",
      } satisfies RecipesServiceRequestBody["membersUpdateCollections"]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
