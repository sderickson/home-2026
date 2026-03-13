// for shared mappers between database models and API response types
// import types from both the adjacent spec and db packages, and map one to the other
import type { MenuEntity, RecipeEntity } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipeToApiRecipe } from "../recipes/_helpers.ts";

type ListMenus200 = RecipesServiceResponseBody["listMenus"][200];
type MenuApi = ListMenus200["menus"][number];
type GetMenu200 = RecipesServiceResponseBody["getMenu"][200];
type CreateMenu200 = RecipesServiceResponseBody["createMenu"][200];
type UpdateMenu200 = RecipesServiceResponseBody["updateMenu"][200];

export function menuToApiMenu(row: MenuEntity): MenuApi {
  return {
    id: row.id,
    collectionId: row.collectionId,
    name: row.name,
    isPublic: row.isPublic,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
    editedByUserIds: row.editedByUserIds,
    groupings: row.groupings,
  };
}

export function listMenusResultToListMenusResponse(
  rows: MenuEntity[],
): ListMenus200 {
  return {
    menus: rows.map(menuToApiMenu),
  };
}

export function getMenuResultToGetMenuResponse(
  menu: MenuEntity,
  recipes: RecipeEntity[],
): GetMenu200 {
  return {
    menu: menuToApiMenu(menu),
    recipes: recipes.map((r) => recipeToApiRecipe(r)),
  };
}

export function createMenuResultToCreateMenuResponse(
  menu: MenuEntity,
): CreateMenu200 {
  return {
    menu: menuToApiMenu(menu),
  };
}

export function updateMenuResultToUpdateMenuResponse(
  menu: MenuEntity,
): UpdateMenu200 {
  return {
    menu: menuToApiMenu(menu),
  };
}
