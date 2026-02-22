import { describe, it, expect } from "vitest";
import { ingredientLine } from "./Detail.logic.ts";

describe("Detail logic", () => {
  describe("ingredientLine", () => {
    it("joins quantity, unit, and name in order", () => {
      expect(
        ingredientLine({ name: "Flour", quantity: "2", unit: "cups" }),
      ).toBe("2 cups Flour");
    });

    it("omits empty quantity and unit", () => {
      expect(
        ingredientLine({ name: "Salt", quantity: "", unit: "" }),
      ).toBe("Salt");
    });

    it("omits only empty unit", () => {
      expect(
        ingredientLine({ name: "Eggs", quantity: "3", unit: "" }),
      ).toBe("3 Eggs");
    });

    it("returns name when all parts empty", () => {
      expect(
        ingredientLine({ name: "Optional garnish", quantity: "", unit: "" }),
      ).toBe("Optional garnish");
    });
  });
});
