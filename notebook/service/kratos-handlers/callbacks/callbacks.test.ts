import { afterEach, describe, expect, it } from "vitest";
import { sentEmails } from "@saflib/email-service";
import { callbacks } from "./index.ts";

describe("callbacks", () => {
  afterEach(() => {
    sentEmails.length = 0;
  });

  it("sends a verification email through the mock email service", async () => {
    await callbacks.onVerificationCodeValid?.({
      recipient: "user@notebook.scotterickson.info",
      user: {
        id: "identity-1",
        email: "user@notebook.scotterickson.info",
      },
      templateData: {},
      verificationCode: "123456",
      verificationUrl: "http://account.docker.localhost/verification?flow=abc",
      expiresInMinutes: 15,
    });

    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0]?.to).toBe("user@notebook.scotterickson.info");
    expect(sentEmails[0]?.subject).toBe("Verify your email address");
    expect(sentEmails[0]?.html).toContain("123456");
    expect(sentEmails[0]?.html).toContain("Verify email");
  });

  it("sends a recovery email through the mock email service", async () => {
    await callbacks.onRecoveryCodeValid?.({
      recipient: "user@notebook.scotterickson.info",
      user: {
        id: "identity-1",
        email: "user@notebook.scotterickson.info",
      },
      templateData: {},
      recoveryCode: "654321",
      expiresInMinutes: 15,
    });

    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0]?.to).toBe("user@notebook.scotterickson.info");
    expect(sentEmails[0]?.subject).toBe("Reset your password");
    expect(sentEmails[0]?.html).toContain("654321");
  });
});
