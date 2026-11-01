import { describe, expect, it } from "vitest";
import {
  emailFromSearch,
  parseMarketingUnsubscribeEmail,
} from "./MarketingUnsubscribe.logic.ts";

describe("emailFromSearch", () => {
  it("preserves plus-addressing from a bare + in the query", () => {
    expect(emailFromSearch("?email=user+tag@notebook.scotterickson.info")).toBe(
      "user+tag@notebook.scotterickson.info",
    );
  });

  it("decodes percent-encoded email", () => {
    expect(emailFromSearch("?email=user%2Btag%40notebook.scotterickson.info")).toBe(
      "user+tag@notebook.scotterickson.info",
    );
  });
});

describe("parseMarketingUnsubscribeEmail", () => {
  it("reads a non-empty email query param", () => {
    expect(parseMarketingUnsubscribeEmail({ email: " alex@notebook.scotterickson.info " })).toBe(
      "alex@notebook.scotterickson.info",
    );
  });

  it("prefers raw search so + is not turned into a space", () => {
    expect(
      parseMarketingUnsubscribeEmail(
        { email: "user tag@notebook.scotterickson.info" },
        "/unsubscribe?email=user+tag@notebook.scotterickson.info",
      ),
    ).toBe("user+tag@notebook.scotterickson.info");
  });

  it("returns undefined when missing or blank", () => {
    expect(parseMarketingUnsubscribeEmail({})).toBeUndefined();
    expect(parseMarketingUnsubscribeEmail({ email: "  " })).toBeUndefined();
    expect(parseMarketingUnsubscribeEmail({ email: ["a@b.c"] })).toBeUndefined();
  });
});
