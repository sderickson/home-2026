import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import {
  recipesDb,
  collectionQueries,
  collectionMemberQueries,
  recipeQueries,
} from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import {
  createTestCollection,
  SEED_USER_ID,
} from "../recipes/_test-helpers.ts";

describe("POST /menus", () => {
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

  it("should return 200 with created menu when owner sends valid body", async () => {
    const body = {
      collectionId,
      name: "Weeknight Dinners",
      isPublic: true,
      groupings: [],
    };

    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body.menu).toBeDefined();
    expect(response.body.menu).toMatchObject({
      collectionId,
      name: "Weeknight Dinners",
      isPublic: true,
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(response.body.menu.id).toEqual(expect.any(String));
    expect(response.body.menu.createdAt).toEqual(expect.any(String));
    expect(response.body.menu.updatedAt).toEqual(expect.any(String));
    expect(response.body.menu.editedByUserIds).toEqual([SEED_USER_ID]);
  });

  it("should return 200 with menu including groupings when recipes in same collection", async () => {
    const { result: recipe1 } = await recipeQueries.createWithVersionRecipe(
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
    const { result: recipe2 } = await recipeQueries.createWithVersionRecipe(
      dbKey,
      {
        collectionId,
        title: "Salad",
        subtitle: "Fresh",
        description: null,
        isPublic: true,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
        versionContent: { ingredients: [], instructionsMarkdown: "" },
      },
    );
    expect(recipe1).toBeDefined();
    expect(recipe2).toBeDefined();

    const body = {
      collectionId,
      name: "Dinner Menu",
      isPublic: false,
      groupings: [
        { name: "Mains", recipeIds: [recipe1!.recipe.id, recipe2!.recipe.id] },
        { name: "Sides", recipeIds: [recipe2!.recipe.id] },
      ],
    };

    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body.menu.name).toBe("Dinner Menu");
    expect(response.body.menu.groupings).toHaveLength(2);
    expect(response.body.menu.groupings[0].name).toBe("Mains");
    expect(response.body.menu.groupings[0].recipeIds).toEqual([
      recipe1!.recipe.id,
      recipe2!.recipe.id,
    ]);
    expect(response.body.menu.groupings[1].name).toBe("Sides");
    expect(response.body.menu.groupings[1].recipeIds).toEqual([
      recipe2!.recipe.id,
    ]);
  });

  it("should return 400 when collectionId is missing", async () => {
    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        name: "My Menu",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("collectionId");
  });

  it("should return 400 when recipeId in groupings does not exist", async () => {
    const body = {
      collectionId,
      name: "Menu",
      isPublic: true,
      groupings: [{ name: "Mains", recipeIds: ["nonexistent-recipe-id"] }],
    };

    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
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

    const body = {
      collectionId: otherColl!.id,
      name: "Menu in Other",
      isPublic: true,
      groupings: [
        { name: "Mains", recipeIds: [recipeInMyCollection!.recipe.id] },
      ],
    };

    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("groupings");
  });

  it("should return 401 or 500 when not authenticated", async () => {
    const response = await request(app).post("/menus").send({
      collectionId,
      name: "My Menu",
      isPublic: true,
      groupings: [],
    });
    console.log(response.body);

    expect(response.status).toBe(401);
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

    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({
        collectionId: otherColl!.id,
        name: "Their Menu",
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

    const response = await request(app)
      .post("/menus")
      .set(makeUserHeaders("viewer-user-id", viewerEmail))
      .send({
        collectionId: ownerColl!.id,
        name: "Menu",
        isPublic: true,
        groupings: [],
      });

    expect(response.status).toBe(403);
  });
});
