/**
 * Thumbnail-sized URL for an image. Unsplash hotlinks are resized by Unsplash
 * (w/h/fit/dpr query params); other URLs (uploads) are returned unchanged.
 * @see https://unsplash.com/documentation#dynamically-resizable-images
 */
export function thumbnailImageUrl(url: string, sizePx: number): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.hostname !== "images.unsplash.com") return url;
  parsed.searchParams.set("w", String(sizePx));
  parsed.searchParams.set("h", String(sizePx));
  parsed.searchParams.set("fit", "crop");
  parsed.searchParams.set("dpr", "2");
  return parsed.toString();
}
