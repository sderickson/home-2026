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

const COMMON_UNITS = new Set([
  "tsp", "tbsp", "cup", "cups", "oz", "lb", "g", "kg", "ml", "l",
  "head", "heads", "clove", "cloves", "stalk", "stalks", "slice", "slices",
  "can", "cans", "pinch", "cub", // "cub" common typo for "cup"
]);

/** Matches leading quantity: digits, optional fraction (1/2, ½), or decimal */
const QUANTITY_REGEX = /^(\d+[\d\/.]*|½|¼|¾|⅓|⅔|⅛)\s+/u;

export type ParsedIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type ParsedRecipe = {
  ingredients: ParsedIngredient[];
  instructionsMarkdown: string;
};

function parseIngredientLine(line: string): ParsedIngredient {
  const trimmed = line.trim();
  if (!trimmed) {
    return { name: "", quantity: "", unit: "" };
  }

  let quantity = "";
  let unit = "";
  let name = trimmed;

  const qMatch = trimmed.match(QUANTITY_REGEX);
  if (qMatch) {
    quantity = qMatch[1].replace(/\s/g, "").trim();
    const afterQ = trimmed.slice(qMatch[0].length);
    const parts = afterQ.split(/\s+/);
    if (parts.length > 0) {
      const firstWord = parts[0].toLowerCase();
      if (COMMON_UNITS.has(firstWord)) {
        unit = parts[0];
        name = parts.slice(1).join(" ").trim();
      } else {
        name = afterQ.trim();
      }
    } else {
      name = "";
    }
  }

  return { name, quantity, unit };
}

export function parseRecipePaste(text: string): ParsedRecipe {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const ingredients: ParsedIngredient[] = [];
  const instructionLines: string[] = [];

  let phase: "before_ingredients" | "ingredients" | "instructions" = "before_ingredients";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (phase === "before_ingredients") {
      if (lower === "ingredients" || lower.startsWith("ingredients")) {
        phase = "ingredients";
      } else if (line === "") {
        // Blank before any "Ingredients" header: skip
        continue;
      } else {
        // No header found yet; treat as first ingredient line (flexible paste)
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

    // instructions
    if (line !== "") {
      instructionLines.push(line);
    }
  }

  const instructionsMarkdown = instructionLines
    .map((l, i) => `${i + 1}. ${l}`)
    .join("\n");

  return { ingredients, instructionsMarkdown };
}
