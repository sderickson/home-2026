import type { RouterHistory } from "vue-router";
import { createAuthRouter as createSaflibAuthRouter } from "@saflib/auth";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks } from "@sderickson/hub-links";
import KratosTest from "./pages/KratosTest.vue";

export const createAuthRouter = (options?: { history?: RouterHistory }) => {
  return createSaflibAuthRouter({
    loginRedirect: linkToHrefWithHost(appLinks.home),
    registerRedirect: linkToHrefWithHost(appLinks.home),
    logoutRedirect: linkToHrefWithHost(rootLinks.home),
    history: options?.history,
    additionalRoutes: [
      // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
      { path: "/kratos-test", component: KratosTest },
      // END WORKFLOW AREA
    ],
  });
};
