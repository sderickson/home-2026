import { expect, it, describe } from "vitest";
import { vuetifyConfig } from "@sderickson/notebook-clients-common";
import { notebook_common_strings } from "@sderickson/notebook-clients-common/strings";

describe("notebook-clients-common package exports", () => {
  it("should export vuetify config", () => {
    expect(vuetifyConfig).toBeDefined();
  });

  it("should export strings", () => {
    expect(notebook_common_strings).toBeDefined();
  });
});
