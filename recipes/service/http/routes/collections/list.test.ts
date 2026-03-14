import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import {
  collectionQueries,
  menuQueries,
} from "@sderickson/recipes-db";

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
    expect(response.body).toEqual({
      collections: [],
      members: [],
      menus: [],
    });
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
    expect(response.body).toHaveProperty("menus");
    expect(Array.isArray(response.body.menus)).toBe(true);
    expect(response.body.menus).toHaveLength(0);
  });

  it("should return menus for collections when authenticated and collection has menus", async () => {
    const { result: created, error: createError } =
      await collectionQueries.createCollection(dbKey, {
        id: "with-menus",
        name: "With Menus",
        creatorEmail: SEED_USER_EMAIL,
      });
    expect(createError).toBeUndefined();
    expect(created).toBeDefined();

    const { result: menuResult, error: menuError } =
      await menuQueries.createMenu(dbKey, {
        collectionId: "with-menus",
        name: "Weeknight Dinners",
        isPublic: true,
        createdBy: SEED_USER_EMAIL,
        groupings: [],
      });
    expect(menuError).toBeUndefined();
    expect(menuResult).toBeDefined();

    const response = await request(app)
      .get("/collections")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(200);
    expect(response.body.collections).toHaveLength(1);
    expect(response.body.menus).toHaveLength(1);
    expect(response.body.menus[0]).toMatchObject({
      collectionId: "with-menus",
      name: "Weeknight Dinners",
      isPublic: true,
      createdBy: SEED_USER_EMAIL,
    });
    expect(response.body.menus[0].id).toEqual(expect.any(String));
    expect(response.body.menus[0].createdAt).toEqual(expect.any(String));
    expect(response.body.menus[0].updatedAt).toEqual(expect.any(String));
    expect(response.body.menus[0].editedByUserIds).toEqual(
      expect.any(Array),
    );
    expect(response.body.menus[0].groupings).toEqual([]);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).get("/collections");

    expect(response.status).toBe(401);
  });
});
