import { recipes_common_strings } from "../common/strings.ts";

// BEGIN WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { collections_detail } from "./pages/collections/detail/Detail.strings.ts";
import { create_collection_dialog } from "./components/collections/CreateCollectionDialog.strings.ts";
import { create_menu_form } from "./pages/menus/create/CreateMenuForm.strings.ts";
import { delete_menu_dialog } from "./pages/menus/detail/DeleteMenuDialog.strings.ts";
import { home_page } from "./pages/home/Home.strings.ts";
import { members_management_dialog } from "./components/collections/MembersManagementDialog.strings.ts";
import { menu_edit_form } from "./pages/menus/detail/MenuEditForm.strings.ts";
import { menu_groupings_display } from "./pages/menus/detail/MenuGroupingsDisplay.strings.ts";
import { menus_create } from "./pages/menus/create/Create.strings.ts";
import { menus_detail } from "./pages/menus/detail/Detail.strings.ts";
import { menus_recipe_detail } from "./pages/menus/detail/RecipeDetail.strings.ts";
import { recipe_detail_content } from "./components/recipe-detail/RecipeDetailContent.strings.ts";
import { recipe_form } from "./components/recipes/RecipeForm.strings.ts";
import { recipes_create_page } from "./pages/recipes/create/Create.strings.ts";
import { recipes_detail } from "./pages/recipes/detail/Detail.strings.ts";
import { recipes_detail_page } from "./pages/recipes/detail/Detail.strings.ts";
import { recipes_edit_page } from "./pages/recipes/edit/Edit.strings.ts";
import { unsplash_picker_dialog } from "./pages/recipes/detail/UnsplashPickerDialog.strings.ts";
import { expanded_image_dialog } from "./pages/share/recipes/ExpandedImageDialog.strings.ts";
import { share_recipes } from "./pages/share/recipes/Recipes.strings.ts";
import { share_recipes_error } from "./pages/share/recipes/RecipesError.strings.ts";
// END WORKFLOW AREA

export const app_strings = {
  ...recipes_common_strings,
  // BEGIN WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  collections_detail,
  create_collection_dialog,
  create_menu_form,
  delete_menu_dialog,
  home_page,
  members_management_dialog,
  menu_edit_form,
  menu_groupings_display,
  menus_create,
  menus_detail,
  menus_recipe_detail,
  recipe_detail_content,
  recipe_form,
  recipes_create_page,
  recipes_detail,
  recipes_detail_page,
  recipes_edit_page,
  unsplash_picker_dialog,
  expanded_image_dialog,
  share_recipes,
  share_recipes_error,
  // END WORKFLOW AREA
};
