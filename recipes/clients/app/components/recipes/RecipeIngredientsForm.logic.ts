export type RecipeIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

/**
 * Parse a single line into quantity, unit, and name.
 * First token = quantity, second = unit, rest = name.
 */
export function parseIngredientLine(line: string): RecipeIngredient {
  const trimmed = line.trim();
  if (!trimmed) {
    return { quantity: "", unit: "", name: "" };
  }
  const parts = trimmed.split(/\s+/);
  const quantity = parts[0] ?? "";
  const unit = parts[1] ?? "";
  const name = parts.slice(2).join(" ") ?? "";
  return { quantity, unit, name };
}

export function formatIngredient(ing: RecipeIngredient): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ");
}
