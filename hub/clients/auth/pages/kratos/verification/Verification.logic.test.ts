import type { Session } from "@ory/client";
import { describe, expect, it } from "vitest";
import {
  buildVerificationCodeBody,
  buildVerificationResendCodeBody,
  destinationAfterVerification,
  emailForVerificationResend,
  verificationFlowShouldFetch,
} from "./Verification.logic.ts";

describe("verificationFlowShouldFetch", () => {
  it("returns true when the route has a flow id (email link)", () => {
    expect(verificationFlowShouldFetch(true, null, "flow-1")).toBe(true);
    expect(verificationFlowShouldFetch(false, null, "flow-1")).toBe(true);
  });

  it("returns false while the session query is still pending and there is no flow id", () => {
    expect(verificationFlowShouldFetch(true, undefined, undefined)).toBe(false);
  });

  it("returns true when the session is loaded and the user is logged in (browser verification)", () => {
    expect(verificationFlowShouldFetch(false, { id: "s" } as Session, undefined)).toBe(true);
  });

  it("returns false when there is no session, no flow id, and session is not pending", () => {
    expect(verificationFlowShouldFetch(false, null, undefined)).toBe(false);
  });
});

describe("destinationAfterVerification", () => {
  it("prefers the flow return_to when set", () => {
    expect(destinationAfterVerification("https://app.example/after", "https://fallback")).toBe(
      "https://app.example/after",
    );
  });

  it("uses the fallback when return_to is empty", () => {
    expect(destinationAfterVerification("  ", "https://fallback")).toBe("https://fallback");
    expect(destinationAfterVerification(undefined, "https://fallback")).toBe("https://fallback");
  });
});

describe("buildVerificationCodeBody", () => {
  it("builds a code-method body from form data", () => {
    const fd = new FormData();
    fd.set("csrf_token", "csrf");
    fd.set("code", " 123456 ");
    expect(buildVerificationCodeBody(fd)).toEqual({
      method: "code",
      csrf_token: "csrf",
      code: "123456",
    });
  });
});

describe("emailForVerificationResend", () => {
  it("prefers session identity traits email", () => {
    expect(
      emailForVerificationResend(
        { identity: { traits: { email: "  s@x.com  " } } } as never,
        null,
      ),
    ).toBe("s@x.com");
  });

  it("falls back to an email field on the flow when there is no session email", () => {
    expect(
      emailForVerificationResend(null, {
        ui: {
          nodes: [
            {
              type: "input",
              attributes: {
                node_type: "input",
                name: "email",
                value: "flow@example.com",
              },
            },
          ],
        },
      } as never),
    ).toBe("flow@example.com");
  });
});

describe("buildVerificationResendCodeBody", () => {
  it("sends method code with csrf and email only", () => {
    expect(
      buildVerificationResendCodeBody(
        {
          ui: {
            nodes: [
              {
                type: "input",
                attributes: {
                  node_type: "input",
                  name: "csrf_token",
                  value: "tok",
                },
              },
            ],
          },
        } as never,
        " user@x.com ",
      ),
    ).toEqual({
      method: "code",
      csrf_token: "tok",
      email: "user@x.com",
    });
  });
});
