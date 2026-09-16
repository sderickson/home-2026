import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setClientName } from "@saflib/links";
import {
  restoreDocumentLocationStub,
  stubDocumentLocation,
} from "@saflib/vitest/document-location-stub";
import { getRegisterLinkProps } from "./Home.logic.ts";

beforeEach(() => {
  stubDocumentLocation({
    hostname: "test.docker.localhost",
    host: "test.docker.localhost",
    protocol: "http:",
  });
  setClientName("root");
});

afterEach(() => {
  restoreDocumentLocationStub();
});

describe("getRegisterLinkProps", () => {
  it("returns link props for the auth register page", () => {
    const props = getRegisterLinkProps();
    // Root subdomain !== auth subdomain, so we get href for cross-subdomain navigation
    expect(props).toHaveProperty("href");
    expect((props as { href: string }).href).toContain("/new-registration");
    expect((props as { href: string }).href).toContain("return_to=");
  });

  it("returns an object suitable for v-bind (either to or href)", () => {
    const props = getRegisterLinkProps();
    const hasTo = "to" in props && typeof props.to === "string";
    const hasHref = "href" in props && typeof props.href === "string";
    expect(hasTo || hasHref).toBe(true);
  });
});
