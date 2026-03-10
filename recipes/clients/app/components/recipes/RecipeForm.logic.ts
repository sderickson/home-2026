/**
 * Validation for the recipe form. Form can be submitted when required
 * fields are non-empty (after trim).
 */
export function isRecipeFormValid(model: {
  title: string;
  subtitle: string;
}): boolean {
  return model.title.trim() !== "" && model.subtitle.trim() !== "";
}
