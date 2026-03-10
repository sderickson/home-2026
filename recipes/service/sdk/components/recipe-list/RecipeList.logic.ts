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

/** Substrings (lowercase) in ingredient name that indicate common/pantry items to hide from list card. */
const COMMON_INGREDIENT_SUBSTRINGS = ["oil", "garlic", "salt", "water"];

/**
 * Returns ingredients with common/pantry items filtered out for list card preview.
 * Excludes any ingredient whose name (case-insensitive) contains "oil", "garlic", or "salt".
 */
export function filterKeyIngredients(
  ingredients: { name: string; quantity: string; unit: string }[],
): KeyIngredient[] {
  return ingredients.filter((ing) => {
    const nameLower = ing.name.trim().toLowerCase();
    if (!nameLower) return false;
    return !COMMON_INGREDIENT_SUBSTRINGS.some((sub) => nameLower.includes(sub));
  }) as KeyIngredient[];
}

/**
 * For card display: take the first part of each ingredient name (before the first comma,
 * e.g. "cauliflower, trimmed and cut into florets" → "cauliflower"), then join with commas.
 */
export function formatKeyIngredientsDisplay(
  ingredients: KeyIngredient[],
): string {
  return ingredients
    .map((ing) => (ing.name.split(",")[0] ?? "").trim())
    .filter(Boolean)
    .join(", ");
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
  const ingredients = detail?.currentVersion?.content?.ingredients ?? [];
  const firstImage = files?.find((f) =>
    (f.mimetype ?? "").startsWith("image/"),
  );
  return {
    firstImageUrl: firstImage?.downloadUrl ?? null,
    keyIngredients: filterKeyIngredients(ingredients),
  };
}
