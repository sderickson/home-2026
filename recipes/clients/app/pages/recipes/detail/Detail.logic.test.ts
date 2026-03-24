import { describe, it, expect } from "vitest";
import {
  assertFilesLoaded,
  assertNotesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  buildNoteIdToFilesMap,
  canShowNotesEdit,
  canShowVersionHistory,
  formatVersionDate,
  getVersionById,
  groupNoteFilesByNoteId,
  notesByVersionIdMap,
  notesForLatestVersion,
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
  it("throws when session is undefined", () => {
    expect(() => assertProfileLoaded(undefined)).toThrow(
      "Failed to load session",
    );
  });

  it("throws when session is null", () => {
    expect(() => assertProfileLoaded(null)).toThrow("Failed to load session");
  });

  it("throws when session has no identity", () => {
    expect(() => assertProfileLoaded({})).toThrow("Failed to load session");
  });

  it("does not throw when session has identity", () => {
    expect(() =>
      assertProfileLoaded({ identity: { id: "x", traits: {} } }),
    ).not.toThrow();
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

describe("assertFilesLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertFilesLoaded(undefined)).toThrow(
      "Failed to load recipe files",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertFilesLoaded(null)).toThrow(
      "Failed to load recipe files",
    );
  });

  it("does not throw when data is truthy", () => {
    expect(() => assertFilesLoaded([])).not.toThrow();
  });
});

describe("assertNoteFilesByRecipeLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertNoteFilesByRecipeLoaded(undefined)).toThrow(
      "Failed to load note files",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertNoteFilesByRecipeLoaded(null)).toThrow(
      "Failed to load note files",
    );
  });

  it("does not throw when data is truthy", () => {
    expect(() => assertNoteFilesByRecipeLoaded([])).not.toThrow();
  });
});

describe("canShowVersionHistory", () => {
  it("returns false (no admin signal from Kratos session in this app)", () => {
    expect(canShowVersionHistory({ isAdmin: true })).toBe(false);
    expect(canShowVersionHistory({ isAdmin: false })).toBe(false);
    expect(canShowVersionHistory({})).toBe(false);
  });
});

describe("canShowNotesEdit", () => {
  it("returns false (no admin signal from Kratos session in this app)", () => {
    expect(canShowNotesEdit({ isAdmin: true })).toBe(false);
    expect(canShowNotesEdit({ isAdmin: false })).toBe(false);
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

describe("notesForLatestVersion", () => {
  const notes = [
    { id: "n1", recipeId: "r1", recipeVersionId: "v1", body: "A", everEdited: false, createdBy: "u1", createdAt: "2026-01-01Z", updatedBy: "u1", updatedAt: "2026-01-01Z" },
    { id: "n2", recipeId: "r1", recipeVersionId: "v1", body: "B", everEdited: false, createdBy: "u1", createdAt: "2026-01-02Z", updatedBy: "u1", updatedAt: "2026-01-02Z" },
    { id: "n3", recipeId: "r1", recipeVersionId: "v2", body: "C", everEdited: false, createdBy: "u1", createdAt: "2026-01-03Z", updatedBy: "u1", updatedAt: "2026-01-03Z" },
  ] as Parameters<typeof notesForLatestVersion>[0];

  it("returns empty array when currentVersionId is undefined", () => {
    expect(notesForLatestVersion(notes, undefined)).toEqual([]);
  });

  it("returns notes for the given version newest first", () => {
    const result = notesForLatestVersion(notes, "v1");
    expect(result.map((n) => n.id)).toEqual(["n2", "n1"]);
    expect(result[0].body).toBe("B");
  });

  it("returns empty array when no notes match", () => {
    expect(notesForLatestVersion(notes, "v0")).toEqual([]);
  });
});

describe("buildNoteIdToFilesMap", () => {
  const notes = [{ id: "n1" }, { id: "n2" }];
  const fileA = { id: "f1", recipeNoteId: "n1", blobName: "x", fileOriginalName: "a", mimetype: "application/octet-stream", size: 0, createdAt: "", updatedAt: "", downloadUrl: "https://example.com/f1" };
  const fileB = { id: "f2", recipeNoteId: "n2", blobName: "y", fileOriginalName: "b", mimetype: "application/octet-stream", size: 0, createdAt: "", updatedAt: "", downloadUrl: "https://example.com/f2" };

  it("maps each note id to its files array", () => {
    const results = [{ data: [fileA] }, { data: [fileB] }];
    const map = buildNoteIdToFilesMap(notes, results);
    expect(map.get("n1")).toEqual([fileA]);
    expect(map.get("n2")).toEqual([fileB]);
  });

  it("uses empty array when result has no data", () => {
    const results = [{ data: undefined }, {}];
    const map = buildNoteIdToFilesMap(notes, results);
    expect(map.get("n1")).toEqual([]);
    expect(map.get("n2")).toEqual([]);
  });
});

describe("groupNoteFilesByNoteId", () => {
  const fileA = { id: "f1", recipeNoteId: "n1", blobName: "x", fileOriginalName: "a", mimetype: "application/octet-stream", size: 0, createdAt: "", updatedAt: "", downloadUrl: "https://example.com/f1" };
  const fileB = { id: "f2", recipeNoteId: "n2", blobName: "y", fileOriginalName: "b", mimetype: "application/octet-stream", size: 0, createdAt: "", updatedAt: "", downloadUrl: "https://example.com/f2" };
  const fileC = { id: "f3", recipeNoteId: "n1", blobName: "z", fileOriginalName: "c", mimetype: "application/octet-stream", size: 0, createdAt: "", updatedAt: "", downloadUrl: "https://example.com/f3" };

  it("groups files by recipeNoteId", () => {
    const map = groupNoteFilesByNoteId([fileA, fileB, fileC]);
    expect(map.get("n1")).toHaveLength(2);
    expect(map.get("n1")).toEqual(expect.arrayContaining([fileA, fileC]));
    expect(map.get("n2")).toEqual([fileB]);
  });

  it("returns empty map for empty array", () => {
    expect(groupNoteFilesByNoteId([]).size).toBe(0);
  });
});
