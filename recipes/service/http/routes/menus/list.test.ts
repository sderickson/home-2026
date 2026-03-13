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

  it("should return 400 when neither collectionId nor publicOnly is provided", async () => {
    const response = await request(app)
      .get("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("collectionId");
  });

  it("should return 400 when both collectionId and publicOnly are provided", async () => {
    const response = await request(app)
      .get("/menus")
      .query({ collectionId, publicOnly: true })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("not both");
  });

  it("should return 200 with empty menus for publicOnly=true without auth", async () => {
    const response = await request(app)
      .get("/menus")
      .query({ publicOnly: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ menus: [] });
  });

  it("should return 200 with public menus for publicOnly=true without auth", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Public Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get("/menus")
      .query({ publicOnly: true });

    expect(response.status).toBe(200);
    expect(response.body.menus).toHaveLength(1);
    expect(response.body.menus[0]).toMatchObject({
      id: menu!.id,
      collectionId,
      name: "Public Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(response.body.menus[0].createdAt).toEqual(expect.any(String));
    expect(response.body.menus[0].updatedAt).toEqual(expect.any(String));
    expect(response.body.menus[0].editedByUserIds).toEqual([SEED_USER_ID]);
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
    const { result: publicMenu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Public",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    const { result: privateMenu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Private",
      isPublic: false,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(publicMenu).toBeDefined();
    expect(privateMenu).toBeDefined();

    const response = await request(app)
      .get("/menus")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.menus).toHaveLength(2);
    const names = response.body.menus.map((m: { name: string }) => m.name).sort();
    expect(names).toEqual(["Private", "Public"]);
  });

  it("should return 200 with only public menus when caller is viewer", async () => {
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
      name: "Public",
      isPublic: true,
      createdBy: "owner@example.com",
      groupings: [],
    });
    await menuQueries.createMenu(dbKey, {
      collectionId: ownerColl!.id,
      name: "Private",
      isPublic: false,
      createdBy: "owner@example.com",
      groupings: [],
    });

    const response = await request(app)
      .get("/menus")
      .query({ collectionId: ownerColl!.id })
      .set(makeUserHeaders("viewer-user-id", viewerEmail));

    expect(response.status).toBe(200);
    expect(response.body.menus).toHaveLength(1);
    expect(response.body.menus[0].name).toBe("Public");
    expect(response.body.menus[0].isPublic).toBe(true);
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

  it("should return 403 when collectionId does not exist (membership checked first)", async () => {
    const response = await request(app)
      .get("/menus")
      .query({ collectionId: "nonexistent-collection-id" })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(403);
  });
});
