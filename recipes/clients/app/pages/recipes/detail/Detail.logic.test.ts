import { describe, it, expect } from "vitest";
import {
  assertNotesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canShowNotesEdit,
  canShowVersionHistory,
  formatVersionDate,
  getVersionById,
  notesByVersionIdMap,
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

describe("assertNotesLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertNotesLoaded(undefined)).toThrow(
      "Failed to load notes",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertNotesLoaded(null)).toThrow("Failed to load notes");
  });

  it("does not throw when data is truthy", () => {
    expect(() => assertNotesLoaded([])).not.toThrow();
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

describe("canShowNotesEdit", () => {
  it("returns true when profile.isAdmin is true", () => {
    expect(canShowNotesEdit({ isAdmin: true })).toBe(true);
  });

  it("returns false when profile.isAdmin is false", () => {
    expect(canShowNotesEdit({ isAdmin: false })).toBe(false);
  });

  it("returns false when profile.isAdmin is undefined", () => {
    expect(canShowNotesEdit({})).toBe(false);
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

describe("notesByVersionIdMap", () => {
  it("returns empty map for empty notes", () => {
    const map = notesByVersionIdMap([]);
    expect(map.size).toBe(0);
  });

  it("excludes notes without recipeVersionId", () => {
    const notes = [
      {
        id: "n1",
        recipeId: "r1",
        recipeVersionId: null,
        body: "Note",
        everEdited: false,
        createdBy: "u1",
        createdAt: "2026-01-01T00:00:00Z",
        updatedBy: "u1",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ] as Parameters<typeof notesByVersionIdMap>[0];
    const map = notesByVersionIdMap(notes);
    expect(map.size).toBe(0);
  });

  it("groups notes by recipeVersionId", () => {
    const notes = [
      {
        id: "n1",
        recipeId: "r1",
        recipeVersionId: "v1",
        body: "Note 1",
        everEdited: false,
        createdBy: "u1",
        createdAt: "2026-01-01T00:00:00Z",
        updatedBy: "u1",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "n2",
        recipeId: "r1",
        recipeVersionId: "v1",
        body: "Note 2",
        everEdited: false,
        createdBy: "u1",
        createdAt: "2026-01-02T00:00:00Z",
        updatedBy: "u1",
        updatedAt: "2026-01-02T00:00:00Z",
      },
      {
        id: "n3",
        recipeId: "r1",
        recipeVersionId: "v2",
        body: "Note 3",
        everEdited: false,
        createdBy: "u1",
        createdAt: "2026-01-03T00:00:00Z",
        updatedBy: "u1",
        updatedAt: "2026-01-03T00:00:00Z",
      },
    ] as Parameters<typeof notesByVersionIdMap>[0];
    const map = notesByVersionIdMap(notes);
    expect(map.size).toBe(2);
    expect(map.get("v1")).toHaveLength(2);
    expect(map.get("v2")).toHaveLength(1);
    expect(map.get("v1")?.map((n) => n.id)).toEqual(["n1", "n2"]);
    expect(map.get("v2")?.[0].body).toBe("Note 3");
  });
});

describe("getVersionById", () => {
  const versions = [
    { id: "v1", recipeId: "r1", content: {}, isLatest: true, createdBy: "u1", createdAt: "2026-01-01Z" },
    { id: "v2", recipeId: "r1", content: {}, isLatest: false, createdBy: "u1", createdAt: "2026-01-02Z" },
  ] as Parameters<typeof getVersionById>[0];

  it("returns version when id exists", () => {
    expect(getVersionById(versions, "v1")).toEqual(versions[0]);
    expect(getVersionById(versions, "v2")).toEqual(versions[1]);
  });

  it("returns undefined when id is not found", () => {
    expect(getVersionById(versions, "v0")).toBeUndefined();
    expect(getVersionById([], "v1")).toBeUndefined();
  });
});
