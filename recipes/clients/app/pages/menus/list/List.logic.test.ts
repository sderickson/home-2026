import { describe, it, expect } from "vitest";
import {
  assertMenusListLoaded,
  getMenusList,
} from "./List.logic.ts";

describe("assertMenusListLoaded", () => {
  it("does not throw when collection and menus data are valid", () => {
    expect(() =>
      assertMenusListLoaded(
        { collection: { id: "c1", name: "Kitchen" } },
        { menus: [] },
      ),
    ).not.toThrow();
  });

  it("throws when collection data is null", () => {
    expect(() => assertMenusListLoaded(null, { menus: [] })).toThrow(
      "Failed to load collection",
    );
  });

  it("throws when collection data is undefined", () => {
    expect(() => assertMenusListLoaded(undefined, { menus: [] })).toThrow(
      "Failed to load collection",
    );
  });

  it("throws when collection data has no collection property", () => {
    expect(() => assertMenusListLoaded({}, { menus: [] })).toThrow(
      "Failed to load collection",
    );
  });

  it("throws when menus data is undefined", () => {
    expect(() =>
      assertMenusListLoaded(
        { collection: { id: "c1" } },
        undefined,
      ),
    ).toThrow("Failed to load menus");
  });

  it("throws when menus data is null", () => {
    expect(() =>
      assertMenusListLoaded({ collection: { id: "c1" } }, null),
    ).toThrow("Failed to load menus");
  });
});

describe("getMenusList", () => {
  it("returns empty array when data is undefined", () => {
    expect(getMenusList(undefined)).toEqual([]);
  });

  it("returns empty array when data.menus is undefined", () => {
    expect(getMenusList({})).toEqual([]);
  });

  it("returns the menus array when provided", () => {
    const menus = [{ id: "m1", name: "Dinner", isPublic: true }];
    expect(getMenusList({ menus })).toBe(menus);
    expect(getMenusList({ menus })).toEqual(menus);
  });
});
