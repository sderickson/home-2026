import { expect, it, describe } from "vitest";
import { vuetifyConfig } from "@sderickson/recipes-clients-common";
import { recipes_common_strings } from "@sderickson/recipes-clients-common/strings";

describe("recipes-clients-common package exports", () => {
  it("should export vuetify config", () => {
    expect(vuetifyConfig).toBeDefined();
  });

  it("should export strings", () => {
    expect(recipes_common_strings).toBeDefined();
  });
});
