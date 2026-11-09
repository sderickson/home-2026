import { afterEach, describe, expect, it } from "vitest";
import {
  rememberSettingsFlowSection,
  settingsSectionForFlow,
} from "./settings-flow-return.ts";

describe("settings flow return", () => {
  afterEach(() => sessionStorage.clear());

  it("returns the section that started a flow", () => {
    rememberSettingsFlowSection("flow-1", "/mfa");
    expect(settingsSectionForFlow("flow-1")).toBe("/mfa");
  });

  it("returns nothing for unknown or missing flows", () => {
    expect(settingsSectionForFlow("nope")).toBeUndefined();
    expect(settingsSectionForFlow(undefined)).toBeUndefined();
  });

  it("ignores stored values that are not plain section paths", () => {
    sessionStorage.setItem(
      "hub.account.settings-flow-section.flow-2",
      "https://evil.example/",
    );
    expect(settingsSectionForFlow("flow-2")).toBeUndefined();
  });
});
