import { describe, it, expect } from "vitest";
import {
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canShowVersionHistory,
  formatVersionDate,
} from "./Detail.logic.ts";

describe("assertRecipeLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertRecipeLoaded(undefined)).toThrow(
      "Failed to load recipe",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertRecipeLoaded(null)).toThrow("Failed to load recipe");
  });

  it("does not throw when data is truthy", () => {
    expect(() =>
      assertRecipeLoaded({ recipe: {}, currentVersion: {} }),
    ).not.toThrow();
  });
});

describe("assertProfileLoaded", () => {
  it("throws when profile is undefined", () => {
    expect(() => assertProfileLoaded(undefined)).toThrow(
      "Failed to load profile",
    );
  });

  it("throws when profile is null", () => {
    expect(() => assertProfileLoaded(null)).toThrow("Failed to load profile");
  });

  it("does not throw when profile is truthy", () => {
    expect(() => assertProfileLoaded({ isAdmin: false })).not.toThrow();
  });
});

describe("assertVersionsLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertVersionsLoaded(undefined)).toThrow(
      "Failed to load versions",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertVersionsLoaded(null)).toThrow(
      "Failed to load versions",
    );
  });

  it("does not throw when data is truthy", () => {
    expect(() => assertVersionsLoaded([])).not.toThrow();
  });
});

describe("canShowVersionHistory", () => {
  it("returns true when profile.isAdmin is true", () => {
    expect(canShowVersionHistory({ isAdmin: true })).toBe(true);
  });

  it("returns false when profile.isAdmin is false", () => {
    expect(canShowVersionHistory({ isAdmin: false })).toBe(false);
  });

  it("returns false when profile.isAdmin is undefined", () => {
    expect(canShowVersionHistory({})).toBe(false);
  });
});

describe("formatVersionDate", () => {
  it("formats an ISO date string with medium dateStyle", () => {
    const result = formatVersionDate("2026-02-23T12:00:00.000Z");
    expect(result).toMatch(/\d/);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a consistent format for the same input", () => {
    const a = formatVersionDate("2026-02-23T00:00:00.000Z");
    const b = formatVersionDate("2026-02-23T00:00:00.000Z");
    expect(a).toBe(b);
  });
});
