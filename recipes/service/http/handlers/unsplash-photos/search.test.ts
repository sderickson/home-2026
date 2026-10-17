import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeAdminHeaders, makeUserHeaders } from "@saflib/express";

describe("GET /unsplash-photos/search (searchUnsplashPhotos)", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 with unsplashPhotos array when admin sends valid query", async () => {
    const response = await request(app)
      .get("/unsplash-photos/search")
      .query({ q: "recipe", perPage: 10 })
      .set(makeAdminHeaders());

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("unsplashPhotos");
    expect(Array.isArray(response.body.unsplashPhotos)).toBe(true);
    if (response.body.unsplashPhotos.length > 0) {
      const item = response.body.unsplashPhotos[0];
      expect(item).toMatchObject({
        id: expect.any(String),
        thumbUrl: expect.any(String),
        regularUrl: expect.any(String),
        downloadLocation: expect.any(String),
      });
    }
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app)
      .get("/unsplash-photos/search")
      .query({ q: "recipe" });

    expect(response.status).toBe(401);
  });

  it("should return 200 when non-admin", async () => {
    const response = await request(app)
      .get("/unsplash-photos/search")
      .query({ q: "recipe" })
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
  });
});
