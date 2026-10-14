import { describe, it, expect } from "vitest";
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { mockRecipeFiles } from "@sderickson/recipes-sdk/fakes";
import { filterImageFiles, stepImageFile } from "./ExpandedImageDialog.logic.ts";

function withMimetype(file: RecipeFileInfo, mimetype: string): RecipeFileInfo {
  return { ...file, mimetype };
}

describe("filterImageFiles", () => {
  it("keeps only image/* mimetypes", () => {
    const files = [
      withMimetype(mockRecipeFiles[0], "image/jpeg"),
      withMimetype(mockRecipeFiles[1], "application/pdf"),
      withMimetype(mockRecipeFiles[2], "image/png"),
    ];
    expect(filterImageFiles(files).map((f) => f.id)).toEqual([
      mockRecipeFiles[0].id,
      mockRecipeFiles[2].id,
    ]);
  });

  it("treats empty mimetype as non-image", () => {
    expect(filterImageFiles([withMimetype(mockRecipeFiles[0], "")])).toEqual(
      [],
    );
  });
});

describe("stepImageFile", () => {
  const images = mockRecipeFiles.slice(0, 2);

  it("returns null when there are no images", () => {
    expect(stepImageFile([], images[0].id, 1)).toBeNull();
  });

  it("steps forward and wraps around", () => {
    expect(stepImageFile(images, images[0].id, 1)?.id).toBe(images[1].id);
    expect(stepImageFile(images, images[1].id, 1)?.id).toBe(images[0].id);
  });

  it("steps backward and wraps around", () => {
    expect(stepImageFile(images, images[0].id, -1)?.id).toBe(images[1].id);
    expect(stepImageFile(images, images[1].id, -1)?.id).toBe(images[0].id);
  });
});
