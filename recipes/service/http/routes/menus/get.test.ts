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
  recipeQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import { createTestCollection, SEED_USER_ID } from "../recipes/_test-helpers.ts";

describe("GET /menus/:id", () => {
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
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "A Menu",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app).get(`/menus/${menu!.id}`);

    expect(response.status).toBe(400);
  });

  it("should return 200 with menu and empty recipes when authenticated with collectionId", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Test Menu",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      menu: {
        id: menu!.id,
        collectionId,
        name: "Test Menu",
        createdBy: SEED_USER_ID,
        groupings: [],
      },
      recipes: [],
    });
    expect(response.body.menu.createdAt).toEqual(expect.any(String));
    expect(response.body.menu.updatedAt).toEqual(expect.any(String));
    expect(response.body.menu.editedByUserIds).toEqual([SEED_USER_ID]);
  });

  it("should return 200 with menu and recipes when menu has groupings", async () => {
    const { result: recipe1 } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Recipe One",
        subtitle: "First",
        description: null,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    const { result: recipe2 } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Recipe Two",
        subtitle: "Second",
        description: null,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    expect(recipe1).toBeDefined();
    expect(recipe2).toBeDefined();

    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu With Recipes",
      createdBy: SEED_USER_ID,
      groupings: [
        { name: "Mains", recipeIds: [recipe1!.recipe.id, recipe2!.recipe.id] },
      ],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.menu.id).toBe(menu!.id);
    expect(response.body.menu.name).toBe("Menu With Recipes");
    expect(response.body.recipes).toHaveLength(2);
    const titles = response.body.recipes.map((r: { title: string }) => r.title);
    expect(titles).toContain("Recipe One");
    expect(titles).toContain("Recipe Two");
    expect(response.body.recipes[0]).toMatchObject({
      title: expect.any(String),
      subtitle: expect.any(String),
      createdBy: SEED_USER_ID,
    });
    expect(response.body.recipes[0].createdAt).toEqual(expect.any(String));
  });

  it("should return 200 when caller is viewer", async () => {
    const viewerEmail = "viewer@example.com";
    const { result: ownerColl } = await collectionQueries.createCollection(
      dbKey,
      {
        name: "Owner Collection",
        creatorEmail: "owner@example.com",
      },
    );
    expect(ownerColl).toBeDefined();
    await collectionMemberQueries.addCollectionMember(dbKey, {
      collectionId: ownerColl!.id,
      email: viewerEmail,
      role: "viewer",
    });
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId: ownerColl!.id,
      name: "Viewer Menu",
      createdBy: "owner@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId: ownerColl!.id })
      .set(makeUserHeaders("viewer-user-id", viewerEmail));

    expect(response.status).toBe(200);
    expect(response.body.menu.id).toBe(menu!.id);
  });

  it("should return 401 when not authenticated", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "A Menu",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId });

    expect(response.status).toBe(401);
  });

  it("should return 403 when collectionId does not match menu collection", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId: "other-collection-id" })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(403);
  });

  it("should return 403 when caller is not a member of the collection", async () => {
    const { result: otherColl } = await collectionQueries.createCollection(
      dbKey,
      {
        name: "Other",
        creatorEmail: "other@example.com",
      },
    );
    expect(otherColl).toBeDefined();
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId: otherColl!.id,
      name: "Their Menu",
      createdBy: "other@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId: otherColl!.id })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(403);
  });

  it("should return 404 when menu does not exist", async () => {
    const response = await request(app)
      .get("/menus/nonexistent-menu-id")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MENU_NOT_FOUND");
  });

  it("should return 200 and filter out missing recipes when menu references recipe that does not exist", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu With Bad Recipe Id",
      createdBy: SEED_USER_ID,
      groupings: [
        { name: "Mains", recipeIds: ["nonexistent-recipe-id"] },
      ],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.menu).toBeDefined();
    expect(response.body.menu.groupings).toEqual([
      { name: "Mains", recipeIds: [] },
    ]);
    expect(response.body.recipes).toEqual([]);
  });
});
