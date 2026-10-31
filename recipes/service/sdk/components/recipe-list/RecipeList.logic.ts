import { isIngredientHeader } from "../../ingredient.ts";
import { thumbnailImageUrl } from "../../image-url.ts";

/** Card, list-row, and diner photos render at about 44–60px. */
const CARD_THUMBNAIL_PX = 64;

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
 * Excludes group headers and any ingredient whose name (case-insensitive) contains "oil", "garlic", or "salt".
 */
export function filterKeyIngredients(
  ingredients: { name: string; quantity: string; unit: string }[],
): KeyIngredient[] {
  return ingredients.filter((ing) => {
    if (isIngredientHeader(ing)) return false;
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
  recipeId?: string;
  mimetype?: string | null;
  downloadUrl?: string | null;
}

/** Detail-like shape with currentVersion.content.ingredients (e.g. from getRecipe API). */
export interface RecipeDetailLike {
  currentVersion?: {
    recipeId?: string;
    content?: {
      ingredients?: { name: string; quantity: string; unit: string }[];
    };
  } | null;
}

export interface CardEnrichment {
  firstImageUrl: string | null;
  keyIngredients: KeyIngredient[];
}

/** Lowercase blob of ingredient names, quantities, and units for client-side search. */
export function recipeDetailIngredientsSearchText(
  detail: RecipeDetailLike | undefined,
): string {
  const ingredients = detail?.currentVersion?.content?.ingredients ?? [];
  return ingredients
    .map((i) =>
      [i.name, i.quantity, i.unit]
        .map((s) => (s ?? "").trim())
        .filter(Boolean)
        .join(" "),
    )
    .join(" ")
    .toLowerCase();
}

/**
 * Derives card display data from getRecipe and files-list responses.
 * Used by the list grid and list view so enrichment lives next to the card.
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
    firstImageUrl: firstImage?.downloadUrl
      ? thumbnailImageUrl(firstImage.downloadUrl, CARD_THUMBNAIL_PX)
      : null,
    keyIngredients: filterKeyIngredients(ingredients),
  };
}

/**
 * Card enrichment for each recipe, keyed by recipe id, from the flat
 * `currentVersions` and `files` arrays that list responses include.
 */
export function getCardEnrichmentsByRecipeId(
  recipes: { id: string }[],
  currentVersions: NonNullable<RecipeDetailLike["currentVersion"]>[],
  files: RecipeFileLike[],
): Map<string, CardEnrichment> {
  const map = new Map<string, CardEnrichment>();
  for (const recipe of recipes) {
    map.set(
      recipe.id,
      getCardEnrichment(
        { currentVersion: currentVersions.find((v) => v.recipeId === recipe.id) },
        files.filter((f) => f.recipeId === recipe.id),
      ),
    );
  }
  return map;
}
