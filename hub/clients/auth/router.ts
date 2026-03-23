import type { RouterHistory } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { PageNotFound } from "@saflib/vue/components";
import { authLinks } from "@sderickson/hub-links";
import KratosTest from "./pages/KratosTest.vue";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import KratosLoginAsync from "./pages/kratos/login/LoginAsync.vue";
import KratosRegistrationAsync from "./pages/kratos/registration/RegistrationAsync.vue";
import KratosVerificationAsync from "./pages/kratos/verification/VerificationAsync.vue";
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
      // END WORKFLOW AREA
      { path: "/:pathMatch(.*)*", component: PageNotFound },
    ],
  });
};
