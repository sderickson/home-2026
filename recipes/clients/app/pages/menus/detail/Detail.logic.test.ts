import { describe, it, expect } from "vitest";
import {
  assertMenuDetailLoaded,
  canEditMenuForRole,
  buildUpdateMenuPayload,
} from "./Detail.logic.ts";

describe("assertMenuDetailLoaded", () => {
  const validProfile = { email: "u@example.com" };
  const validCollection = { collection: { id: "c1", name: "Kitchen" } };
  const validMembers = { members: [] };
  const validMenuData = { menu: { id: "m1", name: "Dinner" }, recipes: [] };
  const validRecipes = [] as unknown[];

  it("does not throw when all data is valid", () => {
    expect(() =>
      assertMenuDetailLoaded(
        validProfile,
        validCollection,
        validMembers,
        validMenuData,
        validRecipes,
      ),
    ).not.toThrow();
  });

  it("throws when profile is null", () => {
    expect(() =>
      assertMenuDetailLoaded(
        null,
        validCollection,
        validMembers,
        validMenuData,
        validRecipes,
      ),
    ).toThrow("Failed to load profile");
  });

  it("throws when menu data has no menu property", () => {
    expect(() =>
      assertMenuDetailLoaded(
        validProfile,
        validCollection,
        validMembers,
        {},
        validRecipes,
      ),
    ).toThrow("Failed to load menu");
  });

  it("throws when recipes data is null", () => {
    expect(() =>
      assertMenuDetailLoaded(
        validProfile,
        validCollection,
        validMembers,
        validMenuData,
        null,
      ),
    ).toThrow("Failed to load recipes");
  });
});

describe("canEditMenuForRole", () => {
  it("returns true for owner", () => {
    expect(canEditMenuForRole("owner")).toBe(true);
  });

  it("returns true for editor", () => {
    expect(canEditMenuForRole("editor")).toBe(true);
  });

  it("returns false for viewer", () => {
    expect(canEditMenuForRole("viewer")).toBe(false);
  });

  it("returns false when role is undefined", () => {
    expect(canEditMenuForRole(undefined)).toBe(false);
  });
});

describe("buildUpdateMenuPayload", () => {
  it("trims name and filters empty groupings", () => {
    const payload = buildUpdateMenuPayload(
      {
        name: "  Updated Name  ",
        isPublic: true,
        groupings: [
          { name: "Mains", recipeIds: ["r1"] },
          { name: "  ", recipeIds: [] },
          { name: "Sides", recipeIds: [] },
        ],
      },
      "menu-1",
      "coll-1",
    );
    expect(payload).toEqual({
      id: "menu-1",
      collectionId: "coll-1",
      name: "Updated Name",
      isPublic: true,
      groupings: [
        { name: "Mains", recipeIds: ["r1"] },
        { name: "Sides", recipeIds: [] },
      ],
    });
  });
});
