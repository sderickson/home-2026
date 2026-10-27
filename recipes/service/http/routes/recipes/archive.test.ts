import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";
import { recipesDb, recipeQueries, menuQueries } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { createTestCollection, SEED_USER_ID } from "./_test-helpers.ts";

describe("PUT /recipes/:id/archive", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let collectionId: string;
  let recipeId: string;

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    collectionId = await createTestCollection(dbKey);
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId,
      title: "To Archive",
      subtitle: "Short",
      description: null,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    if (!result) throw new Error("Expected createWithVersionRecipe to return result");
    recipeId = result.recipe.id;
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("archives the recipe, removes it from menus and hides it from the list", async () => {
    const { result: menu } = await menuQueries.createMenu(dbKey, {
      collectionId,
      name: "Weeknights",
      createdBy: SEED_USER_ID,
      groupings: [{ name: "Mains", recipeIds: [recipeId] }],
    });

    const response = await request(app)
      .put(`/recipes/${recipeId}/archive`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({ archived: true });

    expect(response.status).toBe(200);
    const body: RecipesServiceResponseBody["archiveRecipe"][200] =
      response.body;
    expect(body.recipe.archivedAt).toEqual(expect.any(String));
    expect(body.removedFromMenus).toEqual([
      { id: menu!.id, name: "Weeknights" },
    ]);

    const active = await request(app)
      .get(`/recipes?collectionId=${collectionId}`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));
    expect(active.body.recipes).toEqual([]);

    const archived = await request(app)
      .get(`/recipes?collectionId=${collectionId}&archived=true`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID));
    expect(archived.body.recipes.map((r: { id: string }) => r.id)).toEqual([
      recipeId,
    ]);
  });

  it("restores an archived recipe", async () => {
    await recipeQueries.setArchivedRecipe(dbKey, {
      id: recipeId,
      archived: true,
      updatedBy: SEED_USER_ID,
    });

    const response = await request(app)
      .put(`/recipes/${recipeId}/archive`)
      .set(makeAdminHeaders(SEED_USER_ID, SEED_USER_ID))
      .send({ archived: false });

    expect(response.status).toBe(200);
    expect(response.body.recipe.archivedAt).toBeUndefined();
    expect(response.body.removedFromMenus).toEqual([]);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}/archive`)
      .send({ archived: true });

    expect(response.status).toBe(401);
  });

  it("should return 403 when caller is not editor/owner", async () => {
    const response = await request(app)
      .put(`/recipes/${recipeId}/archive`)
      .set(makeUserHeaders("other-user-id", "other@example.com"))
      .send({ archived: true });

    expect(response.status).toBe(403);
  });
});
