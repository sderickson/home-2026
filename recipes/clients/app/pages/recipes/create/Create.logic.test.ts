import { describe, it, expect } from "vitest";
import { assertCreateDataLoaded } from "./Create.logic.ts";

describe("assertCreateDataLoaded", () => {
  it("throws when session is null", () => {
    expect(() => assertCreateDataLoaded(null)).toThrow("Failed to load session");
  });

  it("throws when session is undefined", () => {
    expect(() => assertCreateDataLoaded(undefined)).toThrow("Failed to load session");
  });

  it("does not throw when session has identity", () => {
    expect(() =>
      assertCreateDataLoaded({
        identity: { id: "user-1", traits: { email: "u@example.com" } },
      }),
    ).not.toThrow();
  });
});
