import { createRouter, createWebHistory } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";

// TODO: remove this log once appLinks is being used by the routes
console.log("appLinks:", appLinks);

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view

// END WORKFLOW AREA

export const createAppRouter = () => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view




    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: createWebHistory("/"),
    routes,
  });
};
