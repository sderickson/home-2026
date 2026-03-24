import type { Session, SettingsFlow } from "@ory/client";
import { describe, expect, it } from "vitest";
import {
  buildSettingsUpdateBodyFromFormData,
  settingsFlowShouldFetch,
  settingsNodesForGroup,
} from "./Settings.logic.ts";

describe("settingsFlowShouldFetch", () => {
  it("returns false while the session query is pending", () => {
    expect(settingsFlowShouldFetch(true, undefined)).toBe(false);
  });

  it("returns false when there is no session", () => {
    expect(settingsFlowShouldFetch(false, null)).toBe(false);
  });

  it("returns true when the session is loaded", () => {
    expect(settingsFlowShouldFetch(false, { id: "s" } as Session)).toBe(true);
  });
});

describe("buildSettingsUpdateBodyFromFormData", () => {
  it("builds a profile-method body with traits from FormData", () => {
    const fd = new FormData();
    fd.set("method", "profile");
    fd.set("csrf_token", "tok");
    fd.set("traits.email", "  a@b.co ");
    expect(buildSettingsUpdateBodyFromFormData(fd)).toEqual({
      method: "profile",
      csrf_token: "tok",
      traits: { email: "a@b.co" },
    });
  });

  it("builds a password-method body", () => {
    const fd = new FormData();
    fd.set("method", "password");
    fd.set("csrf_token", "tok");
    fd.set("password", "secret123");
    expect(buildSettingsUpdateBodyFromFormData(fd)).toEqual({
      method: "password",
      csrf_token: "tok",
      password: "secret123",
    });
  });

  it("throws when the method is not supported", () => {
    const fd = new FormData();
    fd.set("method", "totp");
    expect(() => buildSettingsUpdateBodyFromFormData(fd)).toThrow(
      "Unsupported settings method in form",
    );
  });
});

describe("settingsNodesForGroup", () => {
  it("includes CSRF and matching group nodes", () => {
    const flow = {
      ui: {
        nodes: [
          {
            type: "input",
            group: "default",
            attributes: { node_type: "input", name: "csrf_token", type: "hidden", value: "c" },
            meta: {},
            messages: [],
          },
          {
            type: "input",
            group: "profile",
            attributes: { node_type: "input", name: "traits.email", type: "email" },
            meta: {},
            messages: [],
          },
          {
            type: "input",
            group: "password",
            attributes: { node_type: "input", name: "password", type: "password" },
            meta: {},
            messages: [],
          },
        ],
      },
    } as unknown as SettingsFlow;
    const profile = settingsNodesForGroup(flow, "profile");
    expect(profile.map((n) => (n.attributes as { name?: string }).name)).toEqual([
      "csrf_token",
      "traits.email",
    ]);
    const password = settingsNodesForGroup(flow, "password");
    expect(password.map((n) => (n.attributes as { name?: string }).name)).toEqual([
      "csrf_token",
      "password",
    ]);
  });
});
