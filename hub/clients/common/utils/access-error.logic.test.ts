import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { accountLinks } from "@sderickson/hub-links";
import {
  TanstackError,
  AUTH_ERROR_EMAIL_VERIFICATION_REQUIRED,
  AUTH_ERROR_MFA_REQUIRED,
} from "@saflib/sdk";
import {
  hubVerifyEmailHref,
  hubMfaSetupHref,
  isEmailVerificationRequiredError,
  probeHubMfaRequirement,
  resolveHubAccessErrorKind,
} from "./access-error.logic.ts";
import {
  LoginFlowCreated,
  createLoginFlowQueryOptions,
} from "@saflib/ory-kratos-sdk";

describe("access-error.logic", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: {
        href: "http://app.docker.localhost/home",
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects email verification required errors", () => {
    const error = new TanstackError(
      403,
      AUTH_ERROR_EMAIL_VERIFICATION_REQUIRED,
    );

    expect(isEmailVerificationRequiredError(error)).toBe(true);
    expect(resolveHubAccessErrorKind(error)).toBe("email");
  });

  it("maps other auth errors", () => {
    expect(resolveHubAccessErrorKind(new TanstackError(401))).toBe("login");
    expect(
      resolveHubAccessErrorKind(new TanstackError(403, AUTH_ERROR_MFA_REQUIRED)),
    ).toBe("mfa");
  });

  it("builds verify-email href with return_to", () => {
    const href = hubVerifyEmailHref("http://app.docker.localhost/home");
    // A satellite links to its identity owner's page, so compare paths.
    expect(href).toContain(accountLinks.verifyEmail!.path);
    expect(href).toContain(
      "return_to=http%3A%2F%2Fapp.docker.localhost%2Fhome",
    );
  });

  it("builds mfa setup href with return_to", () => {
    const href = hubMfaSetupHref("http://admin.docker.localhost/cron");
    expect(href).toContain(accountLinks.mfa!.path);
    expect(href).toContain(
      "return_to=http%3A%2F%2Fadmin.docker.localhost%2Fcron",
    );
  });

  it("probes MFA setup vs step-up from AAL2 login flow", async () => {
    const setupFlow = {
      id: "flow-setup",
      ui: { nodes: [{ type: "input", attributes: { node_type: "input", type: "hidden" } }] },
    };
    const stepUpFlow = {
      id: "flow-step",
      ui: {
        nodes: [
          { type: "input", attributes: { node_type: "input", type: "text", name: "totp_code" } },
        ],
      },
    };

    const setupClient = {
      fetchQuery: vi.fn(async () => new LoginFlowCreated(setupFlow as any)),
    };
    const stepUpClient = {
      fetchQuery: vi.fn(async () => new LoginFlowCreated(stepUpFlow as any)),
    };

    await expect(probeHubMfaRequirement(setupClient as any)).resolves.toEqual({
      kind: "setup",
      href: hubMfaSetupHref("http://app.docker.localhost/home"),
    });
    await expect(probeHubMfaRequirement(stepUpClient as any)).resolves.toMatchObject({
      kind: "step_up",
    });
    expect(setupClient.fetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: createLoginFlowQueryOptions({
          returnTo: "http://app.docker.localhost/home",
          aal: "aal2",
        }).queryKey,
      }),
    );
  });
});
