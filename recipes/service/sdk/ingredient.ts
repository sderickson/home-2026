/**
 * Shared ingredient line parsing and formatting.
 * Used by quick import (parseRecipePaste) and recipe form (RecipeIngredientsForm).
 *
 * Rules:
 * - Quantity: leading tokens that are only numbers, /, and . are combined
 *   (e.g. "1 1/2", "1.5", "½"). No quantity → entire line is the ingredient name.
 * - Unit: if there is a quantity, the next token is the unit (any word).
 * - Name: the rest after quantity and unit, or the whole line if no quantity.
 */

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

/** Tokens that look like quantity parts: digits, /, . only, or unicode fractions. */
const QUANTITY_TOKEN = /^[\d\/.]+$/u;
const UNICODE_FRACTION = /^[½¼¾⅓⅔⅛]$/u;

function isQuantityToken(t: string): boolean {
  return QUANTITY_TOKEN.test(t) || UNICODE_FRACTION.test(t);
}

/**
 * Parse a single ingredient line into quantity, unit, and name.
 * Quantity = leading number-like tokens ("1 1/2", "1.5", "½").
 * Unit = next token if quantity exists (any word).
 * Name = remainder, or entire line if no quantity (e.g. "salt and pepper").
 */
export function parseIngredientLine(line: string): RecipeIngredient {
  const trimmed = line.trim();
  if (!trimmed) {
    return { name: "", quantity: "", unit: "" };
  }

  const parts = trimmed.split(/\s+/);
  const quantityTokens: string[] = [];
  let i = 0;
  while (i < parts.length && isQuantityToken(parts[i]!)) {
    quantityTokens.push(parts[i]!);
    i++;
  }

  const quantity = quantityTokens.join(" ").trim();
  let unit = "";
  let name = "";

  if (quantity && i < parts.length) {
    unit = parts[i]!;
    i++;
    name = parts.slice(i).join(" ").trim();
  } else if (!quantity) {
    name = trimmed;
  }

  return { quantity, unit, name };
}

/**
 * Format an ingredient back to a single line (quantity unit name, or just name).
 * Omits empty parts so parsing the result round-trips.
 */
export function formatIngredient(ing: RecipeIngredient): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ");
}
