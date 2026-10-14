import type { RecipeFileInfo } from "@sderickson/recipes-spec";

/**
 * Returns only image files (mimetype starts with "image/").
 */
export function filterImageFiles(files: RecipeFileInfo[]): RecipeFileInfo[] {
  return files.filter((f) => (f.mimetype ?? "").startsWith("image/"));
}

/**
 * Steps through image files by delta (wraps around). Returns null when there
 * are no images.
 */
export function stepImageFile(
  imageFiles: RecipeFileInfo[],
  currentId: string | undefined,
  delta: number,
): RecipeFileInfo | null {
  const n = imageFiles.length;
  if (n === 0) return null;
  const currentIndex = imageFiles.findIndex((f) => f.id === currentId);
  return imageFiles[(currentIndex + delta + n) % n] ?? null;
}
