import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type express from "express";
import { hubDb } from "@sderickson/hub-db";
import { getHubOpsDbKey } from "@sderickson/hub-ops";
import { createToken } from "@saflib/ops-db";
import { throwError } from "@saflib/utils";
import { createHubHttpApp } from "./http.ts";

describe("ops API in the hub", () => {
  let app: express.Express;
  let hubDbKey: ReturnType<typeof hubDb.connect>;
  beforeAll(() => {
    hubDbKey = hubDb.connect();
    app = createHubHttpApp({ hubDbKey });
  });
  afterAll(() => {
    hubDb.disconnect(hubDbKey);
  });

  it("requires an ops token", async () => {
    await request(app).get("/ops/health").expect(401);
  });

  it("serves health with a hub-db probe for a valid token", async () => {
    const { token } = await throwError(
      createToken(getHubOpsDbKey(), { name: "test", scopes: ["ops:read"], createdBy: null }),
    );
    const res = await request(app)
      .get("/ops/health")
      .set("authorization", `Bearer ${token}`)
      .expect(200);
    const names = res.body.health.checks.map((c: { name: string }) => c.name);
    expect(names).toEqual(expect.arrayContaining(["process", "disk", "hub-db"]));
    expect(res.body.health.checks.find((c: { name: string }) => c.name === "hub-db").status).toBe("ok");
  });
});
