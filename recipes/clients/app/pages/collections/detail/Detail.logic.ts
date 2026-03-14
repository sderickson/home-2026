import { getMenusList } from "../../menus/list/List.logic.ts";
import {
  assertCollectionLoaded,
  assertProfileLoaded,
  assertRecipesLoaded,
  canShowCreateRecipeForRole,
  getRecipesList,
} from "../../recipes/list/List.logic.ts";

export {
  getMenusList,
  getRecipesList,
  canShowCreateRecipeForRole,
};

/**
 * Asserts that collection detail data (collection, menus, recipes) is loaded.
 */
export function assertCollectionDetailLoaded(
  profile: unknown,
  collectionData: unknown,
  menusData: unknown,
  recipesData: unknown,
): void {
  assertProfileLoaded(profile);
  assertCollectionLoaded(collectionData);
  if (menusData === undefined || menusData === null) {
    throw new Error("Failed to load menus");
  }
  assertRecipesLoaded(recipesData);
}
