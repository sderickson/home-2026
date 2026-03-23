import type { RouterHistory } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { PageNotFound } from "@saflib/vue/components";
import { authLinks } from "@sderickson/hub-links";
import KratosTest from "./pages/KratosTest.vue";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import KratosRegistrationAsync from "./pages/kratos/registration/RegistrationAsync.vue";
// END WORKFLOW AREA

export const createAuthRouter = (options?: { history?: RouterHistory }) => {
  return createRouter({
    history: options?.history ?? createWebHistory(),
    routes: [
      {
        path: "/",
        redirect: (to) => ({
          path: authLinks.kratosRegistration.path,
          query: to.query,
        }),
      },
      // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
      { path: "/kratos-test", component: KratosTest },
      {
        path: authLinks.kratosRegistration.path,
        component: KratosRegistrationAsync,
      },
      // END WORKFLOW AREA
      { path: "/:pathMatch(.*)*", component: PageNotFound },
    ],
  });
};
