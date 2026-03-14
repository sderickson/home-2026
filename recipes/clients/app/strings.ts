import { recipes_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { collections_list } from "./pages/collections/list/List.strings.ts";
import { collections_table } from "./pages/collections/list/CollectionsTable.strings.ts";
import { create_collection_dialog } from "./pages/collections/list/CreateCollectionDialog.strings.ts";
import { create_menu_form } from "./pages/menus/create/CreateMenuForm.strings.ts";
import { delete_menu_dialog } from "./pages/menus/detail/DeleteMenuDialog.strings.ts";
import { home_page } from "./pages/home/Home.strings.ts";
import { members_management_dialog } from "./pages/collections/list/MembersManagementDialog.strings.ts";
import { menu_edit_form } from "./pages/menus/detail/MenuEditForm.strings.ts";
import { menu_groupings_display } from "./pages/menus/detail/MenuGroupingsDisplay.strings.ts";
import { menus_create } from "./pages/menus/create/Create.strings.ts";
import { menus_detail } from "./pages/menus/detail/Detail.strings.ts";
import { menus_list } from "./pages/menus/list/List.strings.ts";
import { menus_list_display } from "./pages/menus/list/MenusListDisplay.strings.ts";
import { recipe_form } from "./components/recipes/RecipeForm.strings.ts";
import { recipes_create_page } from "./pages/recipes/create/Create.strings.ts";
import { recipes_detail } from "./pages/recipes/detail/Detail.strings.ts";
import { recipes_detail_page } from "./pages/recipes/detail/Detail.strings.ts";
import { recipes_edit_page } from "./pages/recipes/edit/Edit.strings.ts";
import { recipes_list_page } from "./pages/recipes/list/List.strings.ts";
import { unsplash_picker_dialog } from "./pages/recipes/detail/UnsplashPickerDialog.strings.ts";
// END WORKFLOW AREA

export const app_strings = {
  ...recipes_common_strings,
  // BEGIN SORTED WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  collections_list,
  collections_table,
  create_collection_dialog,
  create_menu_form,
  delete_menu_dialog,
  home_page,
  members_management_dialog,
  menu_edit_form,
  menu_groupings_display,
  menus_create,
  menus_detail,
  menus_list,
  menus_list_display,
  recipe_form,
  recipes_create_page,
  recipes_detail,
  recipes_detail_page,
  recipes_edit_page,
  recipes_list_page,
  unsplash_picker_dialog,
  // END WORKFLOW AREA
};
