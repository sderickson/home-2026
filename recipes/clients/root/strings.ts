import { recipes_common_strings } from "@sderickson/recipes-clients-common/strings";

// BEGIN SORTED WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { home_page } from "./pages/home/Home.strings.ts";
import { recipes_detail_page } from "./pages/recipes/detail/Detail.strings.ts";
import { recipes_list_page } from "./pages/recipes/list/List.strings.ts";
// END WORKFLOW AREA

export const root_strings = {
  ...recipes_common_strings,
  // BEGIN SORTED WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  home_page,
  recipes_detail_page,
  recipes_list_page,
  // END WORKFLOW AREA
};
