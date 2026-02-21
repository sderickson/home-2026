import { describe, it, expect } from "vitest";
import { assertCreateDataLoaded } from "./Create.logic.ts";

describe("assertCreateDataLoaded", () => {
  it("throws when profile is null", () => {
    expect(() => assertCreateDataLoaded(null)).toThrow("Failed to load profile");
  });

  it("throws when profile is undefined", () => {
    expect(() => assertCreateDataLoaded(undefined)).toThrow("Failed to load profile");
  });

  it("does not throw when profile is truthy", () => {
    expect(() => assertCreateDataLoaded({ id: "user-1" })).not.toThrow();
  });
});
