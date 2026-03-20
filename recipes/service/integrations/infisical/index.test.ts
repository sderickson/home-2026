import { describe, it, expect } from "vitest";
import { infisical, ping } from "@sderickson/recipes-infisical";

describe("@sderickson/recipes-infisical", () => {
  it("should export the client", () => {
    expect(infisical).toBeDefined();
  });

  it("should ping successfully", async () => {
    const result = await ping();
    expect(result).toBeDefined();
  });
});
