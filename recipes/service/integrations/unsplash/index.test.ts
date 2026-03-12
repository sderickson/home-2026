import { describe, it, expect } from "vitest";
import * as exports from "@vendata/iform-unsplash";

describe("@vendata/iform-unsplash", () => {
  it("should export the client", () => {
    expect(exports.unsplash).toBeDefined();
  });

  it("should return a value from ping (uses mock client in tests)", async () => {
    const result = await exports.ping();
    expect(result).toBeDefined();
    if (result.type === "success") {
      expect(result.response).toBeDefined();
      expect(result.response.results).toBeDefined();
      expect(Array.isArray(result.response.results)).toBe(true);
    }
  });
});
