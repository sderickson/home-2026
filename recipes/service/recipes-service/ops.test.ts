import { describe, expect, it } from "vitest";
import request from "supertest";
import { makeAdminHeaders } from "@saflib/express";
import { createToken } from "@saflib/ops-db";
import { throwError } from "@saflib/utils";
import { getRecipesOpsDbKey } from "@sderickson/recipes-ops";
import { createRecipesHttpApp } from "./http.ts";

describe("ops API in recipes", () => {
  const { app } = createRecipesHttpApp();

  it("defers /ops/* past the session gate to the operation's own security", async () => {
    await request(app).get("/ops/health").expect(401);
    const bad = await request(app)
      .get("/ops/health")
      .set("authorization", "Bearer safops_not-a-real-token-000000000000")
      .expect(401);
    expect(bad.body.message).toMatch(/ops token/i);
    await request(app).get("/ops/health").set(makeAdminHeaders()).expect(200);
  });

  it("serves health with recipes' checks for a valid token", async () => {
    const { token } = await throwError(
      createToken(getRecipesOpsDbKey(), { name: "test", scopes: ["ops:read"], createdBy: null }),
    );
    const res = await request(app).get("/ops/health").set("authorization", `Bearer ${token}`).expect(200);
    const names = res.body.health.checks.map((c: { name: string }) => c.name);
    expect(names).toEqual(expect.arrayContaining(["process", "disk", "recipes-db", "jobs", "cron", "kratos"]));
    expect(res.body.health.checks.find((c: { name: string }) => c.name === "recipes-db").status).toBe("ok");
  });

  it("tells the layout whether the caller is a site admin", async () => {
    expect((await request(app).get("/ops/access").expect(200)).body.access.site_admin).toBe(false);
    expect((await request(app).get("/ops/access").set(makeAdminHeaders()).expect(200)).body.access.site_admin).toBe(true);
  });
});
