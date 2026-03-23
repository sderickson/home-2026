import type { RouterHistory } from "vue-router";
import { createAuthRouter as createSaflibAuthRouter } from "@saflib/auth";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks, authLinks } from "@sderickson/hub-links";
import KratosTest from "./pages/KratosTest.vue";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import KratosRegistrationAsync from "./pages/kratos/registration/RegistrationAsync.vue";
// END WORKFLOW AREA

export const createAuthRouter = (options?: { history?: RouterHistory }) => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
    { path: "/kratos-test", component: KratosTest },
    {
      path: authLinks.kratosRegistration.path,
      component: KratosRegistrationAsync,
    },
    // END WORKFLOW AREA
  ];
  return createSaflibAuthRouter({
    loginRedirect: linkToHrefWithHost(appLinks.home),
    registerRedirect: linkToHrefWithHost(appLinks.home),
    logoutRedirect: linkToHrefWithHost(rootLinks.home),
    history: options?.history,
    additionalRoutes: routes,
  });
};
