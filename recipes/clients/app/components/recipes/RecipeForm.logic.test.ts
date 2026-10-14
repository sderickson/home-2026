import { describe, it, expect } from "vitest";
import {
  isRecipeFormValid,
  isSameLocalCalendarDay,
  shouldSaveRecipeVersionInPlace,
} from "./RecipeForm.logic.ts";

describe("isRecipeFormValid", () => {
  it("returns false when title is empty", () => {
    expect(
      isRecipeFormValid({ title: "", subtitle: "A brief description" }),
    ).toBe(false);
  });

  it("returns false when subtitle is empty", () => {
    expect(isRecipeFormValid({ title: "Recipe title", subtitle: "" })).toBe(
      true,
    );
  });

  it("returns true when both are non-empty after trim", () => {
    expect(
      isRecipeFormValid({
        title: "  Recipe title  ",
        subtitle: " Brief description ",
      }),
    ).toBe(true);
  });
});

describe("isSameLocalCalendarDay", () => {
  const reference = new Date(2026, 9, 10, 15, 30, 0);

  it("returns true for another time on the same local day", () => {
    expect(
      isSameLocalCalendarDay("2026-10-10T08:00:00.000Z", reference),
    ).toBe(true);
  });

  it("returns false for the previous local day", () => {
    expect(
      isSameLocalCalendarDay("2026-10-09T23:59:00.000Z", reference),
    ).toBe(false);
  });
});

describe("shouldSaveRecipeVersionInPlace", () => {
  it("matches same-day rule for latest version createdAt", () => {
    const now = new Date(2026, 9, 10, 18, 0, 0);
    const earlierSameDay = new Date(2026, 9, 10, 8, 0, 0).toISOString();
    const previousDay = new Date(2026, 9, 9, 18, 0, 0).toISOString();
    expect(shouldSaveRecipeVersionInPlace(earlierSameDay, now)).toBe(true);
    expect(shouldSaveRecipeVersionInPlace(previousDay, now)).toBe(false);
  });
});
