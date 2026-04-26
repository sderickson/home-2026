import { describe, it, expect } from "vitest";
import {
  assertFilesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canEditInCollection,
  canShowVersionHistory,
  formatVersionDate,
  getVersionById,
} from "./Detail.logic.ts";

describe("assertRecipeLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertRecipeLoaded(undefined)).toThrow("Failed to load recipe");
  });
});

describe("assertProfileLoaded", () => {
  it("throws when session has no identity", () => {
    expect(() => assertProfileLoaded({})).toThrow("Failed to load session");
  });
});

describe("assertVersionsLoaded", () => {
  it("does not throw when data is present", () => {
    expect(() => assertVersionsLoaded([])).not.toThrow();
  });
});

describe("assertFilesLoaded", () => {
  it("does not throw when data is present", () => {
    expect(() => assertFilesLoaded([])).not.toThrow();
  });
});

describe("visibility helpers", () => {
  it("returns false for deprecated admin gates", () => {
    expect(canShowVersionHistory({ isAdmin: true })).toBe(false);
  });

  it("returns true only for collection owner/editor", () => {
    expect(canEditInCollection("owner")).toBe(true);
    expect(canEditInCollection("editor")).toBe(true);
    expect(canEditInCollection("viewer")).toBe(false);
  });
});

describe("formatVersionDate", () => {
  it("formats an ISO date string", () => {
    const result = formatVersionDate("2026-02-23T12:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("getVersionById", () => {
  it("returns a matching version", () => {
    const versions = [
      {
        id: "v1",
        recipeId: "r1",
        content: {},
        isLatest: true,
        createdBy: "u1",
        createdAt: "2026-01-01Z",
      },
    ] as Parameters<typeof getVersionById>[0];
    expect(getVersionById(versions, "v1")).toEqual(versions[0]);
  });
});
