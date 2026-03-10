/**
 * Minimal shape used for diffing in getEditedFields. Kept in logic to avoid importing from .vue.
 */
export interface RecipeFormModelForDiff {
  title: string;
  subtitle: string;
  description?: string | null;
  isPublic: boolean;
  initialVersion: {
    content: {
      ingredients: { name: string; quantity: string; unit: string }[];
      instructionsMarkdown: string;
    };
  };
}

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
 * Returns list of edited field names for commit message.
 */
export function getEditedFields(
  initial: RecipeFormModelForDiff,
  current: RecipeFormModelForDiff,
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
