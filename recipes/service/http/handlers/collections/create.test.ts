import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";
import { recipesDb } from "@sderickson/recipes-db";
import type { DbKey } from "@saflib/drizzle";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

const SEED_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_EMAIL = "create-collections@example.com";

describe("POST /collections", () => {
  let app: express.Express;
  let dbKey: DbKey;
  let priorAdminEmails: string | undefined;

  beforeEach(async () => {
    priorAdminEmails = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = SEED_USER_EMAIL;
    dbKey = recipesDb.connect();
    app = createRecipesHttpApp({ recipesDbKey: dbKey });
  });

  afterEach(() => {
    if (priorAdminEmails === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = priorAdminEmails;
    }
    recipesDb.disconnect(dbKey);
  });

  it("should return 200 with collection when authenticated and name supplied", async () => {
    const body = {
      name: "My Kitchen",
    } satisfies RecipesServiceRequestBody["createCollections"];

    const response = await request(app)
      .post("/collections")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      collection: {
        name: body.name,
        createdBy: SEED_USER_EMAIL,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it("should return 200 with collection and requested id when id supplied", async () => {
    const body = {
      name: "Shared Recipes",
      id: "shared-recipes",
    } satisfies RecipesServiceRequestBody["createCollections"];

    const response = await request(app)
      .post("/collections")
      .set(makeUserHeaders(SEED_USER_ID, SEED_USER_EMAIL))
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      collection: {
        id: "shared-recipes",
        name: body.name,
        createdBy: SEED_USER_EMAIL,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .post("/collections")
      .send({
        name: "Test",
      } satisfies RecipesServiceRequestBody["createCollections"]);

    expect(response.status).toBe(401);
  });
});
