import { accountSdkStrings } from "@saflib/account-sdk/strings";
import { notebook_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA page-string-imports FOR vue/add-view
import { home_page } from "./pages/home/Home.strings.ts";
// END WORKFLOW AREA

export const account_strings = {
  ...notebook_common_strings,
  ...accountSdkStrings,
  // BEGIN SORTED WORKFLOW AREA page-string-object FOR vue/add-view
  home_page,
  // END WORKFLOW AREA
};
