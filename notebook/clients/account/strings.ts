import { accountSdkStrings } from "@saflib/account-sdk/strings";
import { notebook_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { home_page } from "./pages/home/Home.strings.ts";
// END WORKFLOW AREA

export const account_strings = {
  ...notebook_common_strings,
  ...accountSdkStrings,
  // BEGIN SORTED WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  home_page,
  // END WORKFLOW AREA
};
