import { expect, it, describe } from "vitest";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import { hub_common_strings } from "@sderickson/hub-clients-common/strings";

describe("hub-clients-common package exports", () => {
  it("should export vuetify config", () => {
    expect(vuetifyConfig).toBeDefined();
  });

  it("should export strings", () => {
    expect(hub_common_strings).toBeDefined();
  });
});
