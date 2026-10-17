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
import {
  createTestCollection,
  SEED_USER_ID,
} from "../recipes/_test-helpers.ts";

describe("DELETE /menus/:id", () => {
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

  it("should return 204 when owner deletes menu and menu is removed", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "To Delete",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const { result: after } = await menuQueries.getByIdMenu(dbKey, menu!.id);
    expect(after).toBeUndefined();
  });

  it("should return 204 when editor deletes menu", async () => {
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
      createdBy: "owner@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .query({ collectionId: ownerColl!.id })
      .set(makeUserHeaders("editor-user-id", editorEmail));

    expect(response.status).toBe(204);
  });

  it("should return 400 or 500 when collectionId is missing from query", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect([400, 500]).toContain(response.status);
    if (response.status === 400) {
      expect(response.body.message).toContain("collectionId");
    }
  });

  it("should return 401 or 500 when not authenticated", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .query({ collectionId });

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
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId: otherColl!.id,
      name: "Their Menu",
      createdBy: "other@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .query({ collectionId: otherColl!.id })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

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
      createdBy: "owner@example.com",
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .query({ collectionId: ownerColl!.id })
      .set(makeUserHeaders("viewer-user-id", viewerEmail));

    expect(response.status).toBe(403);
  });

  it("should return 404 when menu does not exist", async () => {
    const response = await request(app)
      .delete("/menus/nonexistent-menu-id")
      .query({ collectionId })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MENU_NOT_FOUND");
  });

  it("should return 404 when menu belongs to different collection", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Menu in My Collection",
      createdBy: SEED_USER_ID,
      groupings: [],
    });
    expect(menu).toBeDefined();

    const response = await request(app)
      .delete(`/menus/${menu!.id}`)
      .query({ collectionId: "other-collection-id" })
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_ID));

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MENU_NOT_FOUND");
  });
});
