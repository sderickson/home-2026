import { describe, expect, it } from "vitest";
import {
  credentialsFromLoginForm,
  destinationAfterLogin,
  resolveLoginBrowserReturnTo,
} from "./Login.logic.ts";

describe("resolveLoginBrowserReturnTo", () => {
  it("uses redirect query when present", () => {
    expect(resolveLoginBrowserReturnTo("https://app.example/after", "https://fallback/")).toBe(
      "https://app.example/after",
    );
  });

  it("trims redirect", () => {
    expect(resolveLoginBrowserReturnTo("  https://x/  ", "https://fallback/")).toBe("https://x/");
  });

  it("falls back when redirect is missing or blank", () => {
    expect(resolveLoginBrowserReturnTo(undefined, "https://recipes/")).toBe("https://recipes/");
    expect(resolveLoginBrowserReturnTo("", "https://recipes/")).toBe("https://recipes/");
    expect(resolveLoginBrowserReturnTo("   ", "https://recipes/")).toBe("https://recipes/");
    expect(resolveLoginBrowserReturnTo(123, "https://recipes/")).toBe("https://recipes/");
  });
});

describe("destinationAfterLogin", () => {
  it("prefers flow return_to when set", () => {
    expect(destinationAfterLogin("https://app.example/next", "https://recipes/")).toBe(
      "https://app.example/next",
    );
  });

  it("trims flow return_to", () => {
    expect(destinationAfterLogin("  https://x/  ", "https://recipes/")).toBe("https://x/");
  });

  it("falls back when return_to is empty", () => {
    expect(destinationAfterLogin(undefined, "https://recipes/")).toBe("https://recipes/");
    expect(destinationAfterLogin("", "https://recipes/")).toBe("https://recipes/");
  });
});

describe("credentialsFromLoginForm", () => {
  it("reads identifier and password", () => {
    const fd = new FormData();
    fd.set("identifier", "a@b.co");
    fd.set("password", "secret");
    expect(credentialsFromLoginForm(fd)).toEqual({
      identifier: "a@b.co",
      password: "secret",
    });
  });

  it("trims identifier and defaults password to empty string", () => {
    const fd = new FormData();
    fd.set("identifier", "  x@y.z  ");
    expect(credentialsFromLoginForm(fd)).toEqual({
      identifier: "x@y.z",
      password: "",
    });
  });
});
