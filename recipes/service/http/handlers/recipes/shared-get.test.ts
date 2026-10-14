// @ts-nocheck — scaffold placeholders until express/add-handler copies this file.
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { makeUserHeaders } from "@saflib/express";
import type { RequestBody as sharedGetRecipesRequestBody } from "@sderickson/recipes-spec/operations/sharedGetRecipes";
import {
  acquireRouterSlimRouteTest,
  releaseSlimRouteTest,
  type SlimRouteTestContext,
} from "#test/slim-route-test.ts";
import { createRecipesRouter } from "./index.ts";

describe("sharedGetRecipes", () => {
  let ctx: SlimRouteTestContext;

  beforeAll(() => {
    ctx = acquireRouterSlimRouteTest(createRecipesRouter);
  });

  afterAll(() => {
    releaseSlimRouteTest(ctx.lease);
  });



  // TODO: unskip this test
  it.skip("should handle successful requests", async () => {
    const response = await request(ctx.app)
      .post("/recipes/shared-get")
      .set(makeUserHeaders())
      .send({
        // @ts-expect-error - TODO: remove this line as part of workflow
      } satisfies sharedGetRecipesRequestBody["sharedGetRecipes"]);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      // TODO: Add expected response structure
      // Focus on identifiers and important data fields
      // Avoid asserting on fields that might change frequently
      // Use expect.any(...) for fields which change with each test
    });
  });

  // TODO: unskip this test
  it.skip("should return 4xx for ...", async () => {
    // make a request which will return the targeted error
    const response = await request(ctx.app)
      .post("/recipes/shared-get")
      .set(makeUserHeaders())
      .send({
        // ...
      });

    expect(response.status).toBe(409); // or other 4xx status code
    // Don't assert on response.body.message
  });
});
