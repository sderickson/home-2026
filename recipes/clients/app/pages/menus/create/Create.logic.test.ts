import { describe, it, expect } from "vitest";
import {
  assertCreateDataLoaded,
  canEditMenuForRole,
  buildCreateMenuPayload,
} from "./Create.logic.ts";

describe("assertCreateDataLoaded", () => {
  const validProfile = { email: "u@example.com" };
  const validCollection = { collection: { id: "c1", name: "Kitchen" } };
  const validMembers = { members: [] };
  const validRecipes = [] as unknown[];

  it("does not throw when all data is valid", () => {
    expect(() =>
      assertCreateDataLoaded(
        validProfile,
        validCollection,
        validMembers,
        validRecipes,
      ),
    ).not.toThrow();
  });

  it("throws when profile is null", () => {
    expect(() =>
      assertCreateDataLoaded(
        null,
        validCollection,
        validMembers,
        validRecipes,
      ),
    ).toThrow("Failed to load profile");
  });

  it("throws when collection data has no collection property", () => {
    expect(() =>
      assertCreateDataLoaded(
        validProfile,
        {},
        validMembers,
        validRecipes,
      ),
    ).toThrow("Failed to load collection");
  });

  it("throws when members data is undefined", () => {
    expect(() =>
      assertCreateDataLoaded(
        validProfile,
        validCollection,
        undefined,
        validRecipes,
      ),
    ).toThrow("Failed to load members");
  });

  it("throws when recipes data is null", () => {
    expect(() =>
      assertCreateDataLoaded(
        validProfile,
        validCollection,
        validMembers,
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

describe("buildCreateMenuPayload", () => {
  it("trims name and filters empty groupings", () => {
    const payload = buildCreateMenuPayload(
      {
        name: "  Weeknight Dinners  ",
        isPublic: true,
        groupings: [
          { name: "Mains", recipeIds: ["r1"] },
          { name: "  ", recipeIds: [] },
          { name: "Sides", recipeIds: [] },
        ],
      },
      "my-kitchen",
    );
    expect(payload).toEqual({
      collectionId: "my-kitchen",
      name: "Weeknight Dinners",
      isPublic: true,
      groupings: [
        { name: "Mains", recipeIds: ["r1"] },
        { name: "Sides", recipeIds: [] },
      ],
    });
  });

  it("uses empty recipeIds when grouping has none", () => {
    const payload = buildCreateMenuPayload(
      {
        name: "Menu",
        isPublic: false,
        groupings: [{ name: "Starters", recipeIds: [] }],
      },
      "c1",
    );
    expect(payload.groupings[0].recipeIds).toEqual([]);
  });

  it("trims grouping names", () => {
    const payload = buildCreateMenuPayload(
      {
        name: "Menu",
        isPublic: false,
        groupings: [{ name: "  Mains  ", recipeIds: ["r1"] }],
      },
      "c1",
    );
    expect(payload.groupings[0].name).toBe("Mains");
  });
});
