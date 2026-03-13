import { describe, it, expect } from "vitest";
import {
  assertProfileLoaded,
  assertCollectionsLoaded,
  getCollectionsList,
} from "./List.logic.ts";

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
    expect(() =>
      assertProfileLoaded({ email: "user@example.com" }),
    ).not.toThrow();
  });
});

describe("assertCollectionsLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertCollectionsLoaded(undefined)).toThrow(
      "Failed to load collections",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertCollectionsLoaded(null)).toThrow(
      "Failed to load collections",
    );
  });

  it("does not throw when data is truthy", () => {
    expect(() => assertCollectionsLoaded({ collections: [] })).not.toThrow();
  });
});

describe("getCollectionsList", () => {
  it("returns empty array when data is undefined", () => {
    expect(getCollectionsList(undefined)).toEqual([]);
  });

  it("returns the array when data is provided", () => {
    const list = [{ id: "c1", name: "Kitchen" }];
    expect(getCollectionsList(list)).toBe(list);
    expect(getCollectionsList(list)).toEqual([
      { id: "c1", name: "Kitchen" },
    ]);
  });
});
