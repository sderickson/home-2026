import type { RouterHistory } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { PageNotFound } from "@saflib/vue/components";
import { authLinks } from "@sderickson/hub-links";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import KratosLoginAsync from "./pages/kratos/login/LoginAsync.vue";
import KratosNewLoginAsync from "./pages/kratos/new-login/NewLoginAsync.vue";
// import KratosRecoveryAsync from "./pages/kratos/recovery/RecoveryAsync.vue";
// import KratosSettingsAsync from "./pages/kratos/settings/SettingsAsync.vue";
import KratosRegistrationAsync from "./pages/kratos/registration/RegistrationAsync.vue";
import KratosNewRegistrationAsync from "./pages/kratos/new-registration/NewRegistrationAsync.vue";
import KratosVerificationAsync from "./pages/kratos/verification/VerificationAsync.vue";
import KratosVerifyWallAsync from "./pages/kratos/verify-wall/VerifyWallAsync.vue";
import LogoutAsync from "./pages/kratos/logout/LogoutAsync.vue";
// END WORKFLOW AREA

export const createAuthRouter = (options?: { history?: RouterHistory }) => {
  return createRouter({
    history: options?.history ?? createWebHistory(),
    routes: [
      /**
       * Auth SPA home: start sign-in from `/new-login` (browser flow creation). Preserves query.
       */
      {
        path: "/",
        redirect: (to) => ({
          path: authLinks.kratosNewLogin.path,
          query: to.query,
        }),
      },
      // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
      {
        path: authLinks.kratosRegistration.path,
        component: KratosRegistrationAsync,
      },
      {
        path: authLinks.kratosNewRegistration.path,
        component: KratosNewRegistrationAsync,
      },
      {
        path: authLinks.kratosLogin.path,
        component: KratosLoginAsync,
      },
      {
        path: authLinks.kratosNewLogin.path,
        component: KratosNewLoginAsync,
      },
      {
        path: authLinks.kratosVerification.path,
        component: KratosVerificationAsync,
      },
      {
        path: authLinks.kratosVerifyWall.path,
        component: KratosVerifyWallAsync,
      },
      {
        path: authLinks.logout.path,
        component: LogoutAsync,
      },
      // {
      //   path: authLinks.kratosRecovery.path,
      //   component: KratosRecoveryAsync,
      // },
      // {
      //   path: authLinks.kratosSettings.path,
      //   component: KratosSettingsAsync,
      // },
      // END WORKFLOW AREA
      { path: "/:pathMatch(.*)*", component: PageNotFound },
    ],
  });
};
