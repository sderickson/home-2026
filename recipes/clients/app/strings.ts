import { recipes_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA page-string-imports FOR vue/add-view
import { home_page } from "./pages/home/Home.strings.ts";
import { create_recipe_form } from "./pages/recipes/create/CreateRecipeForm.strings.ts";
import { recipes_create_page } from "./pages/recipes/create/Create.strings.ts";
import { recipe_content_preview } from "./pages/recipes/create/RecipeContentPreview.strings.ts";
import { recipes_detail_page } from "./pages/recipes/detail/Detail.strings.ts";
import { recipes_list_page } from "./pages/recipes/list/List.strings.ts";
// END WORKFLOW AREA

export const app_strings = {
  ...recipes_common_strings,
  // BEGIN SORTED WORKFLOW AREA page-string-object FOR vue/add-view
  home_page,
  create_recipe_form,
  recipes_create_page,
  recipe_content_preview,
  recipes_detail_page,
  recipes_list_page,
  // END WORKFLOW AREA
};
