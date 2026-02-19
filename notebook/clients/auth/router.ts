import { createRouter, createWebHistory } from "vue-router";
import { authLinks } from "@sderickson/notebook-links";
import { PageNotFound } from "@saflib/vue/components";

// TODO: remove this log once authLinks is being used by the routes
console.log("authLinks:", authLinks);

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view

// END WORKFLOW AREA

export const createAuthRouter = () => {
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
