import type {
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import {
  formatKeyIngredientsDisplay,
  getCardEnrichment,
  type CardEnrichment,
} from "@sderickson/recipes-sdk";

/**
 * Asserts that the public shared-menu payload is loaded.
 * AsyncPage gates rendering until the query succeeds; this keeps the page
 * typed for the happy path.
 */
export function assertSharedMenuLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load shared menu");
  }
}

export interface SharedMenuDisplayData {
  recipeById: Map<string, { id: string; title: string; subtitle?: string }>;
  /** Subtitle, or key ingredients when a recipe has no subtitle. */
  subtextByRecipeId: Map<string, string>;
  /** First image and key ingredients per recipe (diner cards). */
  enrichmentByRecipeId: Map<string, CardEnrichment>;
}

/**
 * Builds the lookups FancyMenuDisplay / DinerMenuDisplay need from the shared
 * menu response (no per-recipe queries, unlike the authenticated menu page).
 */
export function sharedMenuDisplayData(data: {
  recipes: Recipe[];
  currentVersions: RecipeVersion[];
  files: RecipeFileInfo[];
}): SharedMenuDisplayData {
  const recipeById = new Map<
    string,
    { id: string; title: string; subtitle?: string }
  >();
  const subtextByRecipeId = new Map<string, string>();
  const enrichmentByRecipeId = new Map<string, CardEnrichment>();

  for (const recipe of data.recipes) {
    recipeById.set(recipe.id, {
      id: recipe.id,
      title: recipe.title,
      subtitle: recipe.subtitle ?? "",
    });
    const currentVersion = data.currentVersions.find(
      (v) => v.recipeId === recipe.id,
    );
    const enrichment = getCardEnrichment(
      { currentVersion },
      data.files.filter((f) => f.recipeId === recipe.id),
    );
    enrichmentByRecipeId.set(recipe.id, enrichment);
    const subtext =
      recipe.subtitle?.trim() ||
      formatKeyIngredientsDisplay(enrichment.keyIngredients);
    if (subtext) subtextByRecipeId.set(recipe.id, subtext);
  }

  return { recipeById, subtextByRecipeId, enrichmentByRecipeId };
}
