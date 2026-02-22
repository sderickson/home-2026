import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { rootLinks } from "@sderickson/notebook-links";
import { PageNotFound } from "@saflib/vue/components";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import HomeAsync from "./pages/home/HomeAsync.vue";
// END WORKFLOW AREA

export const createRootRouter = (options?: { history?: RouterHistory }) => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view

    {
      path: rootLinks.home.path,
      component: HomeAsync,
    },
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: options?.history ?? createWebHistory("/"),
    routes,
  });
};
