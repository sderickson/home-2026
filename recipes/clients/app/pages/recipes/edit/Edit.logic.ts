import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";

type GetRecipeResponse = RecipesServiceResponseBody["getRecipe"][200];

/**
 * Asserts that edit page data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertEditDataLoaded(data: unknown): asserts data is GetRecipeResponse {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe");
  }
}

/**
 * Build form model from getRecipe response for editing.
 */
export function recipeToFormModel(response: GetRecipeResponse): RecipeFormModel {
  const { recipe, currentVersion } = response;
  const recipeWithCollection = recipe as { collectionId?: string };
  return {
    collectionId: recipeWithCollection.collectionId ?? "my-kitchen",
    title: recipe.title,
    subtitle: recipe.subtitle,
    description: recipe.description ?? null,
    initialVersion: {
      content: {
        ingredients: [...currentVersion.content.ingredients],
        instructionsMarkdown: currentVersion.content.instructionsMarkdown ?? "",
      },
    },
    note: "",
  };
}

export { getEditedFields } from "../../../components/recipes/RecipeForm.logic";
