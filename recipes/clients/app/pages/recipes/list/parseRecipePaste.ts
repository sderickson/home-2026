/**
 * Parses pasted recipe text (e.g. from Google Docs) into structured ingredients
 * and markdown instructions.
 *
 * Expected format:
 * - Line "Ingredients" (or similar)
 * - One line per ingredient: optional quantity, optional unit, then name/prep
 *   e.g. "1 head cauliflower, trimmed and cut into florets"
 * - Blank line
 * - One line per instruction (numbers added as markdown list)
 */

import {
  parseIngredientLine,
  type RecipeIngredient,
} from "@sderickson/recipes-sdk";

export type ParsedIngredient = RecipeIngredient;

export type ParsedRecipe = {
  ingredients: ParsedIngredient[];
  instructionsMarkdown: string;
};

export function parseRecipePaste(text: string): ParsedRecipe {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const ingredients: ParsedIngredient[] = [];
  const instructionLines: string[] = [];

  let phase: "before_ingredients" | "ingredients" | "instructions" =
    "before_ingredients";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (phase === "before_ingredients") {
      if (lower === "ingredients" || lower.startsWith("ingredients")) {
        phase = "ingredients";
      } else if (line === "") {
        continue;
      } else {
        phase = "ingredients";
        const ing = parseIngredientLine(line);
        if (ing.name || ing.quantity || ing.unit) {
          ingredients.push(ing);
        }
      }
      continue;
    }

    if (phase === "ingredients") {
      if (line === "") {
        phase = "instructions";
        continue;
      }
      const ing = parseIngredientLine(line);
      if (ing.name || ing.quantity || ing.unit) {
        ingredients.push(ing);
      }
      continue;
    }

    if (line !== "") {
      instructionLines.push(line);
    }
  }

  const instructionsMarkdown = instructionLines
    .map((l, i) => `${i + 1}. ${l}`)
    .join("\n");

  return { ingredients, instructionsMarkdown };
}
