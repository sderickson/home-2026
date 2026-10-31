import { describe, expect, it } from "vitest";
import { thumbnailImageUrl } from "./image-url.ts";

describe("thumbnailImageUrl", () => {
  it("resizes Unsplash hotlinks, overriding existing size params", () => {
    const url = thumbnailImageUrl(
      "https://images.unsplash.com/photo-abc?ixid=x&w=1600&fit=max&auto=format",
      64,
    );
    const params = new URL(url).searchParams;
    expect(params.get("ixid")).toBe("x");
    expect(params.get("auto")).toBe("format");
    expect(params.get("w")).toBe("64");
    expect(params.get("h")).toBe("64");
    expect(params.get("fit")).toBe("crop");
    expect(params.get("dpr")).toBe("2");
  });

  it("leaves other URLs alone", () => {
    const blob = "https://api.example.com/recipes/r1/files/f1/blob";
    expect(thumbnailImageUrl(blob, 64)).toBe(blob);
    expect(thumbnailImageUrl("/relative/blob", 64)).toBe("/relative/blob");
  });
});
