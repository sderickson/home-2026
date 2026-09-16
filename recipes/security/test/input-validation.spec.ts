import { expect, test } from "@playwright/test";
import { recipesApiOrigin } from "../fixtures/http-helpers.ts";

const api = recipesApiOrigin();

test.describe("input validation (public errors/record)", () => {
  test("HTML-like content in JSON body returns 400", async ({ request }) => {
    const res = await request.post(`${api}/errors/record`, {
      data: {
        reported_error: {
          kind: "client",
          message: "boom<script>alert(1)</script>",
          source: "security-probe",
        },
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("oversized JSON body hits express limit (413)", async ({ request }) => {
    const huge = "z".repeat(3 * 1024 * 1024);
    const res = await request.post(`${api}/errors/record`, {
      data: {
        reported_error: {
          kind: "client",
          message: huge,
          source: "security-probe",
        },
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(413);
  });

  test("missing required OpenAPI fields returns 400", async ({ request }) => {
    const res = await request.post(`${api}/errors/record`, {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });
});
