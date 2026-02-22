/** Single ingredient as used in recipe version content. */
export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
};

/**
 * Formats an ingredient for display as a single line (quantity, unit, name).
 * Empty quantity/unit are omitted; falls back to name only if all are empty.
 */
export function ingredientLine(ing: Ingredient): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ").trim() || ing.name;
}
