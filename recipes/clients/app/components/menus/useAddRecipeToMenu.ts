import type { Menu } from "@sderickson/recipes-spec";
import { useUpdateMenuMutation } from "@sderickson/recipes-sdk";
import { addRecipeToGroupings } from "./menuPlacement.logic.ts";

/** Add a recipe to a section of a menu (creating the section if needed). */
export function useAddRecipeToMenu() {
  const updateMenuMutation = useUpdateMenuMutation();

  async function addRecipeToMenu(
    menu: Menu,
    section: string,
    recipeId: string,
  ) {
    return updateMenuMutation.mutateAsync({
      id: menu.id,
      collectionId: menu.collectionId,
      name: menu.name,
      groupings: addRecipeToGroupings(menu.groupings, section, recipeId),
    });
  }

  return { addRecipeToMenu, isPending: updateMenuMutation.isPending };
}
