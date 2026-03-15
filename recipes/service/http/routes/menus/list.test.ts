import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  collectionQueries,
  collectionMemberQueries,
  menuQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "../recipes/_test-helpers.ts";

describe("GET /menus", () => {
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

  it("should return 400 when collectionId is not provided", async () => {
    const response = await request(app)
      .get("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("collectionId");
  });

  it("should return 200 with empty array when collection has no menus", async () => {
    const response = await request(app)
      .get("/menus")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ menus: [] });
  });

  it("should return 200 with all menus when caller is owner", async () => {
    await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "First",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Second",
      createdBy: SEED_USER_ID,
      groupings: [],
    });

    const response = await request(app)
      .get("/menus")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.menus).toHaveLength(2);
    const names = response.body.menus.map((m: { name: string }) => m.name).sort();
    expect(names).toEqual(["First", "Second"]);
  });

  it("should return 200 with all menus when caller is viewer", async () => {
    const viewerEmail = "viewer@example.com";
    const { result: ownerColl } = await collectionQueries.createCollection(dbKey, {
      name: "Owner Collection",
      creatorEmail: "owner@example.com",
    });
    expect(ownerColl).toBeDefined();
    await collectionMemberQueries.addCollectionMember(dbKey, {
      collectionId: ownerColl!.id,
      email: viewerEmail,
      role: "viewer",
    });
    await menuQueries.createMenu(dbKey, {
      collectionId: ownerColl!.id,
      name: "First",
      createdBy: "owner@example.com",
      groupings: [],
    });
    await menuQueries.createMenu(dbKey, {
      collectionId: ownerColl!.id,
      name: "Second",
      createdBy: "owner@example.com",
      groupings: [],
    });

    const response = await request(app)
      .get("/menus")
      .query({ collectionId: ownerColl!.id })
      .set(makeUserHeaders("viewer-user-id", viewerEmail));

    expect(response.status).toBe(200);
    expect(response.body.menus).toHaveLength(2);
    const names = response.body.menus.map((m: { name: string }) => m.name).sort();
    expect(names).toEqual(["First", "Second"]);
  });

  it("should return 401 when collectionId provided and not authenticated", async () => {
    const response = await request(app)
      .get("/menus")
      .query({ collectionId });

    expect(response.status).toBe(401);
  });

  it("should return 403 when collectionId provided and caller is not a member", async () => {
    const { result: otherColl } = await collectionQueries.createCollection(dbKey, {
      name: "Other",
      creatorEmail: "other@example.com",
    });
    expect(otherColl).toBeDefined();

    const response = await request(app)
      .get("/menus")
      .query({ collectionId: otherColl!.id })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(403);
  });

  it("should return 422 when collectionId does not exist (validation)", async () => {
    const response = await request(app)
      .get("/menus")
      .query({ collectionId: "nonexistent-collection-id" })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("COLLECTION_NOT_FOUND");
  });
});
