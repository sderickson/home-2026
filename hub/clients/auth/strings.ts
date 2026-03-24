import { hub_common_strings } from "../common/strings.ts";

// BEGIN SORTED WORKFLOW AREA string-imports FOR vue/add-view sdk/add-component
import { kratos_login_flow } from "./pages/kratos/login/LoginFlowForm.strings.ts";
import { kratos_registration_flow } from "./pages/kratos/registration/RegistrationFlowForm.strings.ts";
import { kratos_verification } from "./pages/kratos/verification/Verification.strings.ts";
import { kratos_verification_flow } from "./pages/kratos/verification/VerificationFlowForm.strings.ts";
import { verify_wall_actions } from "./pages/kratos/verify-wall/VerifyWallActions.strings.ts";
import { verify_wall_blocked_body } from "./pages/kratos/verify-wall/VerifyWallBlockedBody.strings.ts";
import { verify_wall_intro } from "./pages/kratos/verify-wall/VerifyWallIntro.strings.ts";
import { login_intro } from "./pages/kratos/login/LoginIntro.strings.ts";
import { registration_intro } from "./pages/kratos/registration/RegistrationIntro.strings.ts";
import { registration_session_panel } from "./pages/kratos/registration/RegistrationSessionPanel.strings.ts";
import { verification_intro } from "./pages/kratos/verification/VerificationIntro.strings.ts";
// END WORKFLOW AREA

export const auth_strings = {
  ...hub_common_strings,
  // BEGIN SORTED WORKFLOW AREA string-object FOR vue/add-view sdk/add-component
  kratos_login_flow,
  kratos_registration_flow,
  kratos_verification,
  kratos_verification_flow,
  verify_wall_actions,
  verify_wall_blocked_body,
  verify_wall_intro,
  login_intro,
  registration_intro,
  registration_session_panel,
  verification_intro,
  // END WORKFLOW AREA
};
