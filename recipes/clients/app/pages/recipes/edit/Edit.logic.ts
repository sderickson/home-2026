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
  return {
    title: recipe.title,
    subtitle: recipe.subtitle,
    description: recipe.description ?? null,
    isPublic: recipe.isPublic,
    initialVersion: {
      content: {
        ingredients: [...currentVersion.content.ingredients],
        instructionsMarkdown: currentVersion.content.instructionsMarkdown ?? "",
      },
    },
    note: "",
  };
}

const FIELD_LABELS: Record<string, string> = {
  title: "title",
  subtitle: "subtitle",
  description: "description",
  isPublic: "public",
  ingredients: "ingredients",
  instructions: "instructions",
};

function ingredientsEqual(
  a: { name: string; quantity: string; unit: string }[],
  b: { name: string; quantity: string; unit: string }[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((ing, i) => {
    const o = b[i];
    return ing.name === o?.name && ing.quantity === o?.quantity && ing.unit === o?.unit;
  });
}

/**
 * Returns comma-separated list of edited field names for commit message.
 */
export function getEditedFields(
  initial: RecipeFormModel,
  current: RecipeFormModel,
): string[] {
  const fields: string[] = [];
  if (initial.title !== current.title) fields.push(FIELD_LABELS.title);
  if (initial.subtitle !== current.subtitle) fields.push(FIELD_LABELS.subtitle);
  if ((initial.description ?? null) !== (current.description ?? null))
    fields.push(FIELD_LABELS.description);
  if (initial.isPublic !== current.isPublic) fields.push(FIELD_LABELS.isPublic);
  const ic = current.initialVersion.content;
  const ii = initial.initialVersion.content;
  if (!ingredientsEqual(ic.ingredients ?? [], ii.ingredients ?? []))
    fields.push(FIELD_LABELS.ingredients);
  if ((ic.instructionsMarkdown ?? "") !== (ii.instructionsMarkdown ?? ""))
    fields.push(FIELD_LABELS.instructions);
  return fields;
}
