import { createRouter, createWebHistory } from "vue-router";
import { accountLinks } from "@sderickson/hub-links";
import { PageNotFound } from "@saflib/vue/components";

// TODO: remove this log once accountLinks is being used by the routes
console.log("accountLinks:", accountLinks);

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view

// END WORKFLOW AREA

export const createAccountRouter = () => {
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
