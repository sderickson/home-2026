import { expect, test } from "@playwright/test";
import {
  evilOrigin,
  recipesApiOrigin,
  spaOrigin,
} from "../fixtures/http-helpers.ts";
import {
  assertCorsAllowsOrigin,
  assertCorsDoesNotAllowOrigin,
} from "@saflib/security/http/cors";

const api = recipesApiOrigin();
const evil = evilOrigin();
const app = spaOrigin("app.recipes");

test.describe("CORS (recipes API host)", () => {
  test("preflight from evil origin must not allow cross-origin API access", async ({
    request,
  }) => {
    const res = await request.fetch(`${api}/health`, {
      method: "OPTIONS",
      headers: {
        Origin: evil,
        "Access-Control-Request-Method": "GET",
      },
    });
    assertCorsDoesNotAllowOrigin(res.headers(), evil);
  });

  test("preflight from app.recipes origin is allowed for API reads", async ({
    request,
  }) => {
    const res = await request.fetch(`${api}/health`, {
      method: "OPTIONS",
      headers: {
        Origin: app,
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(
      res.status(),
      "OPTIONS preflight from app.recipes → API should succeed",
    ).toBe(204);
    assertCorsAllowsOrigin(res.headers(), app);
  });

  test("simple GET from evil origin must not echo ACAO for credentialed browser fetches", async ({
    request,
  }) => {
    const res = await request.get(`${api}/health`, {
      headers: { Origin: evil },
    });
    assertCorsDoesNotAllowOrigin(res.headers(), evil);
  });
});
