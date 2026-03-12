import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";

describe("listCollections", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 with collections array when authenticated", async () => {
    const response = await request(app)
      .get("/collections")
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      collections: expect.any(Array),
    });
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).get("/collections");

    expect(response.status).toBe(401);
  });
});
