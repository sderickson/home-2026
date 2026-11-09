import { recipes_layout } from "./components/recipes-layout/RecipesLayout.strings.ts";
import { async_page_error } from "./components/recipes-async-page-error/RecipesAsyncPageError.strings.ts";
import { recipes_sdk_strings } from "@sderickson/recipes-sdk/strings";

export const recipes_common_strings = {
  recipes_layout,
  async_page_error,
  ...recipes_sdk_strings,
};
