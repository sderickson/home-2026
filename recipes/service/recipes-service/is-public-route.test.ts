import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { isPublicRecipesRoute } from "./is-public-route.ts";

function req(method: string, path: string): Request {
  return { method, path } as Request;
}

describe("isPublicRecipesRoute", () => {
  // The reviewed public surface. Changing it should be a deliberate edit here
  // and in Caddy's allowlist.
  it.each([
    ["GET", "/recipes/abc/shared"],
    ["GET", "/recipes/abc/shared/files/f1/blob"],
    ["GET", "/menus/abc/shared"],
    ["GET", "/recipes/abc/files"],
    ["GET", "/recipes/abc/versions"],
    ["HEAD", "/recipes/abc/shared"],
  ])("allows %s %s", (method, path) => {
    expect(isPublicRecipesRoute(req(method, path))).toBe(true);
  });

  it.each([
    ["GET", "/recipes"],
    ["GET", "/recipes/abc"],
    ["PUT", "/recipes/abc"],
    ["POST", "/recipes/abc/versions"],
    ["GET", "/menus/abc"],
    ["GET", "/collections"],
    ["GET", "/admin/users/by-id"],
  ])("denies %s %s", (method, path) => {
    expect(isPublicRecipesRoute(req(method, path))).toBe(false);
  });
});
