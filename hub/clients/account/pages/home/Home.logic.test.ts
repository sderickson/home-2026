import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setClientName } from "@saflib/links";
import {
  restoreDocumentLocationStub,
  stubDocumentLocation,
} from "@saflib/vitest/document-location-stub";
import {
  assertProfileLoaded,
  getProfileLinkProps,
  getPasswordLinkProps,
} from "./Home.logic.ts";

beforeEach(() => {
  stubDocumentLocation({
    hostname: "test.docker.localhost",
    host: "test.docker.localhost",
    protocol: "http:",
  });
  setClientName("account");
});

afterEach(() => {
  restoreDocumentLocationStub();
});

const sessionWithIdentity = {
  identity: {
    id: "1",
    traits: { email: "user@example.com" },
  },
};

describe("assertProfileLoaded", () => {
  it("throws when session is null", () => {
    expect(() => assertProfileLoaded(null)).toThrow("Failed to load session");
  });

  it("throws when session is undefined", () => {
    expect(() => assertProfileLoaded(undefined)).toThrow(
      "Failed to load session",
    );
  });

  it("throws when session has no identity", () => {
    expect(() => assertProfileLoaded({})).toThrow("Failed to load session");
  });

  it("does not throw when session has identity", () => {
    expect(() => assertProfileLoaded(sessionWithIdentity)).not.toThrow();
  });
});

describe("getProfileLinkProps", () => {
  it("returns link props for the profile page", () => {
    const props = getProfileLinkProps();
    expect(props).toHaveProperty("to");
    expect((props as { to: string }).to).toBe("/profile");
  });

  it("returns an object suitable for v-bind (either to or href)", () => {
    const props = getProfileLinkProps();
    const hasTo = "to" in props && typeof props.to === "string";
    const hasHref = "href" in props && typeof props.href === "string";
    expect(hasTo || hasHref).toBe(true);
  });
});

describe("getPasswordLinkProps", () => {
  it("returns link props for the password page", () => {
    const props = getPasswordLinkProps();
    expect(props).toHaveProperty("to");
    expect((props as { to: string }).to).toBe("/password");
  });

  it("returns an object suitable for v-bind (either to or href)", () => {
    const props = getPasswordLinkProps();
    const hasTo = "to" in props && typeof props.to === "string";
    const hasHref = "href" in props && typeof props.href === "string";
    expect(hasTo || hasHref).toBe(true);
  });
});
