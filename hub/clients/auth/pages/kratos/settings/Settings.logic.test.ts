import type { Session, SettingsFlow } from "@ory/client";
import { describe, expect, it } from "vitest";
import {
  buildSettingsUpdateBodyFromFormData,
  settingsFlowHasPasswordRecoveryMessage,
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

  it("builds a totp-method body", () => {
    const fd = new FormData();
    fd.set("method", "totp");
    fd.set("csrf_token", "tok");
    fd.set("totp_code", "123456");
    expect(buildSettingsUpdateBodyFromFormData(fd)).toEqual({
      method: "totp",
      csrf_token: "tok",
      totp_code: "123456",
    });
  });

  it("throws when the method is missing", () => {
    const fd = new FormData();
    expect(() => buildSettingsUpdateBodyFromFormData(fd)).toThrow("Unsupported settings method in form");
  });

  it("infers passkey method when only passkey_remove is set (remove credential submit)", () => {
    const fd = new FormData();
    fd.set("csrf_token", "tok");
    fd.set("passkey_remove", "cred-id-123");
    expect(buildSettingsUpdateBodyFromFormData(fd)).toEqual({
      method: "passkey",
      csrf_token: "tok",
      passkey_remove: "cred-id-123",
    });
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
          {
            type: "input",
            group: "totp",
            attributes: { node_type: "input", name: "totp_code", type: "text" },
            meta: {},
            messages: [],
          },
          {
            type: "img",
            group: "totp",
            attributes: { id: "totp_qr", src: "data:image/png;base64,abc" },
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
    const totp = settingsNodesForGroup(flow, "totp");
    expect(totp.map((n) => (n.attributes as { name?: string }).name)).toEqual([
      "csrf_token",
      "totp_code",
      undefined,
    ]);
  });
});

describe("settingsFlowHasPasswordRecoveryMessage", () => {
  it("detects Kratos message id 1060001 (post-recovery password prompt)", () => {
    const flow = {
      ui: {
        messages: [{ id: 1060001, type: "info" as const, text: "Original Kratos copy" }],
      },
    } as SettingsFlow;
    expect(settingsFlowHasPasswordRecoveryMessage(flow)).toBe(true);
  });

  it("returns false when that message is absent", () => {
    const flow = {
      ui: {
        messages: [{ id: 1060002, type: "info" as const, text: "Other" }],
      },
    } as SettingsFlow;
    expect(settingsFlowHasPasswordRecoveryMessage(flow)).toBe(false);
  });
});
