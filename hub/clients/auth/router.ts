import type { RouterHistory } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { PageNotFound } from "@saflib/vue/components";
import { authLinks } from "@sderickson/hub-links";
import KratosTest from "./pages/KratosTest.vue";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import KratosLoginAsync from "./pages/kratos/login/LoginAsync.vue";
import LogoutAsync from "./pages/kratos/logout/LogoutAsync.vue";
import KratosRegistrationAsync from "./pages/kratos/registration/RegistrationAsync.vue";
import KratosVerificationAsync from "./pages/kratos/verification/VerificationAsync.vue";
import KratosVerifyWallAsync from "./pages/kratos/verify-wall/VerifyWallAsync.vue";
// END WORKFLOW AREA

export const createAuthRouter = (options?: { history?: RouterHistory }) => {
  return createRouter({
    history: options?.history ?? createWebHistory(),
    routes: [
      /**
       * Auth SPA home: send users to login (returning sessions redirect to recipes from the page).
       * Registration remains at `/registration`. Preserves `redirect` / `flow` query when present.
       */
      {
        path: "/",
        redirect: (to) => ({
          path: authLinks.kratosLogin.path,
          query: to.query,
        }),
      },
      // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
      { path: "/kratos-test", component: KratosTest },
      {
        path: authLinks.kratosRegistration.path,
        component: KratosRegistrationAsync,
      },
      {
        path: authLinks.kratosLogin.path,
        component: KratosLoginAsync,
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
      // END WORKFLOW AREA
      { path: "/:pathMatch(.*)*", component: PageNotFound },
    ],
  });
};
