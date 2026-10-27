/**
 * Minimal shape used for diffing in getEditedFields. Kept in logic to avoid importing from .vue.
 */
export interface RecipeFormModelForDiff {
  title: string;
  subtitle: string;
  description?: string | null;
  initialVersion: {
    content: {
      ingredients: { name: string; quantity: string; unit: string }[];
      instructionsMarkdown: string;
    };
  };
}

/**
 * Validation for the recipe form. Form can be submitted when the required
 * field (title) is non-empty after trim. Subtitle is optional.
 */
export function isRecipeFormValid(model: {
  title: string;
  subtitle?: string;
}): boolean {
  return model.title.trim() !== "";
}

/** Same local calendar day as `referenceDate` (browser timezone). */
export function isSameLocalCalendarDay(
  isoTimestamp: string,
  referenceDate: Date = new Date(),
): boolean {
  const created = new Date(isoTimestamp);
  return (
    created.getFullYear() === referenceDate.getFullYear() &&
    created.getMonth() === referenceDate.getMonth() &&
    created.getDate() === referenceDate.getDate()
  );
}

/**
 * When saving recipe content, update the latest version in place if the latest
 * version was created on the same local day; otherwise create a new version.
 */
export function shouldSaveRecipeVersionInPlace(
  latestVersionCreatedAt: string,
  referenceDate: Date = new Date(),
): boolean {
  return isSameLocalCalendarDay(latestVersionCreatedAt, referenceDate);
}

const FIELD_LABELS: Record<string, string> = {
  title: "title",
  subtitle: "subtitle",
  description: "description",
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
  const ic = current.initialVersion.content;
  const ii = initial.initialVersion.content;
  if (!ingredientsEqual(ic.ingredients ?? [], ii.ingredients ?? []))
    fields.push(FIELD_LABELS.ingredients);
  if ((ic.instructionsMarkdown ?? "") !== (ii.instructionsMarkdown ?? ""))
    fields.push(FIELD_LABELS.instructions);
  return fields;
}

/**
 * Short labels for HTML the server stripped from instructions, e.g.
 * `<script>`, `onclick on <img>`, `comments`. Order follows the input.
 */
export function describeRemovedHtml(
  removed: { tag: string; attribute?: string }[],
): string[] {
  return removed.map(({ tag, attribute }) => {
    if (tag === "#comment") return "comments";
    return attribute ? `${attribute} on <${tag}>` : `<${tag}>`;
  });
}
