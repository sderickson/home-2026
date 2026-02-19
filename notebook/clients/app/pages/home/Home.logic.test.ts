import { describe, it, expect } from "vitest";
import { assertProfileLoaded } from "./Home.logic.ts";

describe("assertProfileLoaded", () => {
  it("throws when profile is null", () => {
    expect(() => assertProfileLoaded(null)).toThrow("Failed to load profile");
  });

  it("throws when profile is undefined", () => {
    expect(() => assertProfileLoaded(undefined)).toThrow(
      "Failed to load profile",
    );
  });

  it("does not throw when profile is truthy", () => {
    expect(() => assertProfileLoaded({ email: "user@example.com" })).not.toThrow();
  });
});
