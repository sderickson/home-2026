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
const SEED_USER_EMAIL = "members-remove@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "editor@example.com";

describe("DELETE /collections/:id/members/:memberId", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 204 when owner removes non-creator member", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "to-remove",
        name: "To Remove",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const { result: added } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "to-remove",
        email: OTHER_USER_EMAIL,
        role: "editor",
      },
    );
    expect(added).toBeDefined();
    const memberId = added!.id;

    const response = await request(app)
      .delete(`/collections/to-remove/members/${memberId}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const { result: membersAfter } =
      await collectionMemberQueries.listCollectionMember(dbKey, {
        collectionId: "to-remove",
      });
    expect(membersAfter).toHaveLength(1);
    expect(membersAfter![0].email).toBe(SEED_USER_EMAIL);
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

    const { result: added } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "private",
        email: OTHER_USER_EMAIL,
        role: "viewer",
      },
    );
    expect(added).toBeDefined();

    const response = await request(app).delete(
      `/collections/private/members/${added!.id}`,
    );

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

    const { result: added } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "other-collection",
        email: OTHER_USER_EMAIL,
        role: "viewer",
      },
    );
    expect(added).toBeDefined();

    const response = await request(app)
      .delete(`/collections/other-collection/members/${added!.id}`)
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

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
      .delete(`/collections/shared/members/${added!.id}`)
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

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
      .delete("/collections/exists/members/non-existent-member-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });

  it("should return 403 when collection does not exist (caller is not a member)", async () => {
    const response = await request(app)
      .delete("/collections/non-existent-id/members/some-member-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
