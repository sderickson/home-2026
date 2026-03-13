// for shared mappers between database models and API response types
// import types from both the adjacent spec and db packages, and map one to the other
import type { MenuEntity } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";

type ListMenus200 = RecipesServiceResponseBody["listMenus"][200];
type MenuApi = ListMenus200["menus"][number];

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
