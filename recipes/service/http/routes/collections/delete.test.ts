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
  recipeQueries,
} from "@sderickson/recipes-db";

const SEED_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_EMAIL = "delete-collections@example.com";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_USER_EMAIL = "editor@example.com";

describe("DELETE /collections/:id", () => {
  let app: express.Express;
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("should return 204 when owner deletes empty collection", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "to-delete",
        name: "To Delete",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const response = await request(app)
      .delete("/collections/to-delete")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
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

    const response = await request(app).delete("/collections/private");

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

    const response = await request(app)
      .delete("/collections/other-collection")
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

    const { error: addError } = await collectionMemberQueries.addCollectionMember(
      dbKey,
      {
        collectionId: "shared",
        email: OTHER_USER_EMAIL,
        role: "editor",
      },
    );
    expect(addError).toBeUndefined();

    const response = await request(app)
      .delete("/collections/shared")
      .set(makeUserHeaders(OTHER_USER_ID, OTHER_USER_EMAIL));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("should return 409 when collection has recipes", async () => {
    const { result: created } = await collectionQueries.createCollection(
      dbKey,
      {
        id: "with-recipes",
        name: "With Recipes",
        creatorEmail: SEED_USER_EMAIL,
      },
    );
    expect(created).toBeDefined();

    const { error: recipeError } = await recipeQueries.createRecipe(dbKey, {
      collectionId: "with-recipes",
      title: "A Recipe",
      subtitle: "",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
    });
    expect(recipeError).toBeUndefined();

    const response = await request(app)
      .delete("/collections/with-recipes")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("CONFLICT");
  });

  it("should return 403 when collection does not exist (caller is not a member)", async () => {
    const response = await request(app)
      .delete("/collections/non-existent-id")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
