/**
 * Validation for the recipe form. Form can be submitted when required
 * fields are non-empty (after trim).
 */
export function isRecipeFormValid(model: {
  title: string;
  shortDescription: string;
}): boolean {
  return model.title.trim() !== "" && model.shortDescription.trim() !== "";
}
