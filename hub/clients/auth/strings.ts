import { authAppStrings } from "@saflib/auth/strings";
import { hub_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { kratos_registration_flow } from "./pages/kratos/registration/RegistrationFlowForm.strings.ts";
import { registration_intro } from "./pages/kratos/registration/RegistrationIntro.strings.ts";
import { registration_session_panel } from "./pages/kratos/registration/RegistrationSessionPanel.strings.ts";
// END WORKFLOW AREA

export const auth_strings = {
  ...hub_common_strings,
  ...authAppStrings,
  // BEGIN SORTED WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  kratos_registration_flow,
  registration_intro,
  registration_session_panel,
  // END WORKFLOW AREA
};
