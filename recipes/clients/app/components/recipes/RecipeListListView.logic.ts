/** A run of recipes under one letter heading (card-catalog style). */
export interface RecipeLetterGroup<T> {
  /** Uppercase first letter of the title, or "#" for titles not starting with a letter. */
  letter: string;
  recipes: T[];
}

function titleInitial(title: string): string {
  const first = title.trim().charAt(0).toLocaleUpperCase();
  return /\p{L}/u.test(first) ? first : "#";
}

/**
 * Sorts recipes alphabetically by title and groups them under their first letter.
 * Presentation only: does not change what is in the list.
 */
export function groupRecipesByInitial<T extends { title: string }>(
  recipes: T[],
): RecipeLetterGroup<T>[] {
  const sorted = [...recipes].sort((a, b) =>
    a.title.trim().localeCompare(b.title.trim(), undefined, {
      sensitivity: "base",
    }),
  );
  const groups: RecipeLetterGroup<T>[] = [];
  for (const recipe of sorted) {
    const letter = titleInitial(recipe.title);
    const last = groups[groups.length - 1];
    if (last && last.letter === letter) {
      last.recipes.push(recipe);
    } else {
      groups.push({ letter, recipes: [recipe] });
    }
  }
  return groups;
}
