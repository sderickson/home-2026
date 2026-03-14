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
import {
  createTestCollection,
  SEED_USER_ID,
} from "../recipes/_test-helpers.ts";

describe("PUT /menus/:id", () => {
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

  it("should return 200 with updated menu when owner sends valid body", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Original Name",
      isPublic: false,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const body = {
      collectionId,
      name: "Updated Name",
      isPublic: true,
      groupings: [],
    };

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body.menu.id).toBe(menu!.id);
    expect(response.body.menu).toMatchObject({
      collectionId,
      name: "Updated Name",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(response.body.menu.editedByUserIds).toContain(SEED_USER_ID);
  });

  it("should return 200 and append current user to editedByUserIds when not present", async () => {
    const editorEmail = "editor@example.com";
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
      email: editorEmail,
      role: "editor",
    });
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId: ownerColl!.id,
      name: "Menu",
      isPublic: true,
      createdBy: "owner@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();
    expect(menu!.editedByUserIds).toEqual(["owner@example.com"]);

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders("editor-user-id", editorEmail))
      .send({
        collectionId: ownerColl!.id,
        name: "Menu Updated",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(200);
    expect(response.body.menu.name).toBe("Menu Updated");
    expect(response.body.menu.editedByUserIds).toContain("editor-user-id");
    expect(response.body.menu.editedByUserIds).toContain("owner@example.com");
    expect(response.body.menu.editedByUserIds).toHaveLength(2);
  });

  it("should return 200 with updated groupings when recipes in same collection", async () => {
    const { result: recipe } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Pasta",
        subtitle: "Quick",
        description: null,
        isPublic: true,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    expect(recipe).toBeDefined();

    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId,
        name: "Menu",
        isPublic: true,
        groupings: [{ name: "Mains", recipeIds: [recipe!.recipe.id] }],
      });

    expect(response.status).toBe(200);
    expect(response.body.menu.groupings).toHaveLength(1);
    expect(response.body.menu.groupings[0].name).toBe("Mains");
    expect(response.body.menu.groupings[0].recipeIds).toEqual([
      recipe!.recipe.id,
    ]);
  });

  it("should return 400 when collectionId is missing", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        name: "Updated",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("collectionId");
  });

  it("should return 400 when recipeId in groupings does not exist", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId,
        name: "Menu",
        isPublic: true,
        groupings: [{ name: "Mains", recipeIds: ["nonexistent-recipe-id"] }],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("groupings");
  });

  it("should return 400 when recipeId in groupings belongs to different collection", async () => {
    const { result: otherColl } = await collectionQueries.createCollection(
      dbKey,
      {
        name: "Other",
        creatorEmail: "other@example.com",
      },
    );
    expect(otherColl).toBeDefined();
    await collectionMemberQueries.addCollectionMember(dbKey, {
      collectionId: otherColl!.id,
      email: SEED_USER_ID,
      role: "editor",
    });

    const { result: recipeInMyCollection } =
      await recipeQueries.createWithVersionRecipe(dbKey, {
        collectionId,
        title: "Mine",
        subtitle: "Mine",
        description: null,
        isPublic: true,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      });
    expect(recipeInMyCollection).toBeDefined();

    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId: otherColl!.id,
      name: "Menu in Other",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId: otherColl!.id,
        name: "Menu",
        isPublic: true,
        groupings: [
          { name: "Mains", recipeIds: [recipeInMyCollection!.recipe.id] },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("groupings");
  });

  it("should return 401 or 500 when not authenticated", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app).put(`/menus/${menu!.id}`).send({
      collectionId,
      name: "Updated",
      isPublic: true,
      groupings: [],
    });

    expect(response.status).toBe(401);
  });

  it("should return 403 when menu does not belong to body collectionId", async () => {
    const { result: otherColl } = await collectionQueries.createCollection(
      dbKey,
      {
        name: "Other",
        creatorEmail: "other@example.com",
      },
    );
    expect(otherColl).toBeDefined();

    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu in My Collection",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId: otherColl!.id,
        name: "Hacked",
        isPublic: true,
        groupings: [],
      });

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
      isPublic: false,
      createdBy: "other@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId: otherColl!.id,
        name: "Hacked",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(403);
  });

  it("should return 403 when caller is viewer", async () => {
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
      name: "Menu",
      isPublic: true,
      createdBy: "owner@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .put(`/menus/${menu!.id}`)
      .set(makeUserHeaders("viewer-user-id", viewerEmail))
      .send({
        collectionId: ownerColl!.id,
        name: "Updated",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(403);
  });

  it("should return 404 when menu does not exist", async () => {
    const response = await request(app)
      .put("/menus/nonexistent-menu-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId,
        name: "Updated",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MENU_NOT_FOUND");
  });
});
