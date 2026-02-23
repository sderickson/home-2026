import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createRecipesHttpApp } from "../../http.ts";
import { makeUserHeaders } from "@saflib/express";

describe("GET /recipes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createRecipesHttpApp({});
  });

  it("should return 200 and empty array when no recipes exist", async () => {
    const response = await request(app)
      .get("/recipes")
      .set(makeUserHeaders());

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should return 200 when not authenticated (public recipes only)", async () => {
    const response = await request(app).get("/recipes");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
