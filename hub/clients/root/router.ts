import { createRouter, createWebHistory } from "vue-router";
import { rootLinks } from "@sderickson/hub-links";
import { PageNotFound } from "@saflib/vue/components";

// TODO: remove this log once rootLinks is being used by the routes
console.log("rootLinks:", rootLinks);

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import HomeAsync from "./pages/home/HomeAsync.vue";
// END WORKFLOW AREA

export const createRootRouter = () => {
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
    history: createWebHistory("/"),
    routes,
  });
};
