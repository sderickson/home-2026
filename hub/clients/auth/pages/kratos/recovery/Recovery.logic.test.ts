import type { RecoveryFlow, Session } from "@ory/client";
import { describe, expect, it } from "vitest";
import {
  buildRecoveryUpdateBodyFromFormData,
  destinationAfterRecovery,
  recoveryFlowContinueWithUrl,
  recoveryFlowShouldFetch,
} from "./Recovery.logic.ts";

describe("recoveryFlowShouldFetch", () => {
  it("returns true when the route has a flow id (email link)", () => {
    expect(recoveryFlowShouldFetch(true, null, "flow-1")).toBe(true);
    expect(recoveryFlowShouldFetch(false, null, "flow-1")).toBe(true);
  });

  it("returns false while the session query is still pending and there is no flow id", () => {
    expect(recoveryFlowShouldFetch(true, undefined, undefined)).toBe(false);
  });

  it("returns false when the user is signed in and there is no flow id (browser recovery is for logged-out users)", () => {
    expect(recoveryFlowShouldFetch(false, { id: "s" } as Session, undefined)).toBe(false);
  });

  it("returns true when logged out, session loaded, and there is no flow id", () => {
    expect(recoveryFlowShouldFetch(false, null, undefined)).toBe(true);
  });
});

describe("destinationAfterRecovery", () => {
  it("prefers the flow return_to when set", () => {
    expect(destinationAfterRecovery("https://app.example/after", "https://fallback")).toBe(
      "https://app.example/after",
    );
  });

  it("uses the fallback when return_to is empty", () => {
    expect(destinationAfterRecovery("  ", "https://fallback")).toBe("https://fallback");
    expect(destinationAfterRecovery(undefined, "https://fallback")).toBe("https://fallback");
  });
});

describe("buildRecoveryUpdateBodyFromFormData", () => {
  it("builds a link-method body from form data", () => {
    const fd = new FormData();
    fd.set("method", "link");
    fd.set("csrf_token", "csrf");
    fd.set("email", "  user@example.com  ");
    expect(buildRecoveryUpdateBodyFromFormData(fd)).toEqual({
      method: "link",
      csrf_token: "csrf",
      email: "user@example.com",
    });
  });

  it("builds a code-method body with optional fields", () => {
    const fd = new FormData();
    fd.set("method", "code");
    fd.set("csrf_token", "tok");
    fd.set("email", "a@b.co");
    fd.set("code", " 123456 ");
    expect(buildRecoveryUpdateBodyFromFormData(fd)).toMatchObject({
      method: "code",
      csrf_token: "tok",
      email: "a@b.co",
      code: "123456",
    });
  });

  it("throws when the method is not supported", () => {
    const fd = new FormData();
    fd.set("method", "password");
    expect(() => buildRecoveryUpdateBodyFromFormData(fd)).toThrow(
      "Unsupported recovery method in form",
    );
  });
});

describe("recoveryFlowContinueWithUrl", () => {
  it("returns redirect_browser_to when present", () => {
    const flow = {
      continue_with: [
        {
          action: "redirect_browser_to",
          redirect_browser_to: "https://next.example/after",
        },
      ],
    } as RecoveryFlow;
    expect(recoveryFlowContinueWithUrl(flow)).toBe("https://next.example/after");
  });

  it("returns show_settings_ui flow url when present", () => {
    const flow = {
      continue_with: [
        {
          action: "show_settings_ui",
          flow: { id: "sf", url: "https://auth.example/settings" },
        },
      ],
    } as RecoveryFlow;
    expect(recoveryFlowContinueWithUrl(flow)).toBe("https://auth.example/settings");
  });

  it("returns null when there is no navigable continue_with entry", () => {
    expect(recoveryFlowContinueWithUrl({ continue_with: [] } as unknown as RecoveryFlow)).toBe(
      null,
    );
  });
});
