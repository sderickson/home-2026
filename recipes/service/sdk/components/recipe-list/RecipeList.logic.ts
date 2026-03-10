/**
 * Logic for recipe list card enrichment: key ingredients filter and
 * first-image + key ingredients from detail + files data.
 */

/** Ingredient shape for list card preview (key ingredients only). */
export interface KeyIngredient {
  name: string;
  quantity: string;
  unit: string;
}

/** Common ingredients to hide from list card "key ingredients" (lowercase match on name). */
const COMMON_INGREDIENT_NAMES = new Set([
  "salt",
  "pepper",
  "water",
  "oil",
  "olive oil",
  "vegetable oil",
  "extra-virgin olive oil",
  "black pepper",
  "sea salt",
  "kosher salt",
  "salt and pepper",
]);

/**
 * Returns ingredients with common/pantry items filtered out for list card preview.
 */
export function filterKeyIngredients(
  ingredients: { name: string; quantity: string; unit: string }[],
): KeyIngredient[] {
  return ingredients.filter((ing) => {
    const nameLower = ing.name.trim().toLowerCase();
    if (!nameLower) return false;
    return !COMMON_INGREDIENT_NAMES.has(nameLower);
  }) as KeyIngredient[];
}

/** File-like shape with mimetype and downloadUrl (e.g. from files list API). */
export interface RecipeFileLike {
  mimetype?: string | null;
  downloadUrl?: string | null;
}

/** Detail-like shape with currentVersion.content.ingredients (e.g. from getRecipe API). */
export interface RecipeDetailLike {
  currentVersion?: {
    content?: {
      ingredients?: { name: string; quantity: string; unit: string }[];
    };
  } | null;
}

export interface CardEnrichment {
  firstImageUrl: string | null;
  keyIngredients: KeyIngredient[];
}

/**
 * Derives card display data from getRecipe and files-list responses.
 * Used by the list grid so enrichment lives next to the card.
 */
export function getCardEnrichment(
  detail: RecipeDetailLike | undefined,
  files: RecipeFileLike[] | undefined,
): CardEnrichment {
  const ingredients =
    detail?.currentVersion?.content?.ingredients ?? [];
  const firstImage =
    files?.find((f) => (f.mimetype ?? "").startsWith("image/"));
  return {
    firstImageUrl: firstImage?.downloadUrl ?? null,
    keyIngredients: filterKeyIngredients(ingredients),
  };
}
