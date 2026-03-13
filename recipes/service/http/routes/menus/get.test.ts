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

  it("should return 200 with menu and empty recipes for public menu without auth", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Public Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app).get(`/menus/${menu!.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      menu: {
        id: menu!.id,
        collectionId,
        name: "Public Menu",
        isPublic: true,
        createdBy: SEED_USER_ID,
        groupings: [],
      },
      recipes: [],
    });
    expect(response.body.menu.createdAt).toEqual(expect.any(String));
    expect(response.body.menu.updatedAt).toEqual(expect.any(String));
    expect(response.body.menu.editedByUserIds).toEqual([SEED_USER_ID]);
  });

  it("should return 200 with menu and recipes for public menu with groupings", async () => {
    const { result: recipe1 } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Recipe One",
        subtitle: "First",
        description: null,
        isPublic: true,
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
        isPublic: true,
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
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [
        { name: "Mains", recipeIds: [recipe1!.recipe.id, recipe2!.recipe.id] },
      ],
    });
    expect(menu).toBeDefined();

    const response = await request(app).get(`/menus/${menu!.id}`);

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
      isPublic: true,
      createdBy: SEED_USER_ID,
    });
    expect(response.body.recipes[0].createdAt).toEqual(expect.any(String));
  });

  it("should return 200 with menu when collection-scoped and caller is owner", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Private Menu",
      isPublic: false,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(200);
    expect(response.body.menu.id).toBe(menu!.id);
    expect(response.body.menu.isPublic).toBe(false);
    expect(response.body.recipes).toEqual([]);
  });

  it("should return 200 when collection-scoped and caller is viewer and menu is public", async () => {
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
      name: "Public Menu",
      isPublic: true,
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

  it("should return 401 when no collectionId and menu is private", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Private Menu",
      isPublic: false,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app).get(`/menus/${menu!.id}`);

    expect(response.status).toBe(401);
  });

  it("should return 403 when collectionId does not match menu collection", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      isPublic: true,
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

  it("should return 403 when collection-scoped and caller is not a member", async () => {
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
      isPublic: false,
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

  it("should return 403 when caller is viewer and menu is private", async () => {
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
      name: "Private Menu",
      isPublic: false,
      createdBy: "owner@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .get(`/menus/${menu!.id}`)
      .query({ collectionId: ownerColl!.id })
      .set(makeUserHeaders("viewer-user-id", viewerEmail));

    expect(response.status).toBe(403);
  });

  it("should return 404 when menu does not exist", async () => {
    const response = await request(app)
      .get("/menus/nonexistent-menu-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MENU_NOT_FOUND");
  });

  it("should return 404 when menu references recipe that does not exist", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu With Bad Recipe Id",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [
        { name: "Mains", recipeIds: ["nonexistent-recipe-id"] },
      ],
    });
    expect(menu).toBeDefined();

    const response = await request(app).get(`/menus/${menu!.id}`);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("RECIPE_NOT_FOUND");
  });
});
