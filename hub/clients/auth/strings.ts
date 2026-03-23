import { authAppStrings } from "@saflib/auth/strings";
import { hub_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { kratos_registration } from "./pages/kratos/registration/Registration.strings.ts";
// END WORKFLOW AREA

export const auth_strings = {
  ...hub_common_strings,
  ...authAppStrings,
  // BEGIN SORTED WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  kratos_registration,
  // END WORKFLOW AREA
};
