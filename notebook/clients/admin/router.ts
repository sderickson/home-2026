import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { adminLinks } from "@sderickson/notebook-links";
import { PageNotFound } from "@saflib/vue/components";

// TODO: remove this log once adminLinks is being used by the routes
console.log("adminLinks:", adminLinks);

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import AdminAsync from "./pages/admin/AdminAsync.vue";
// END WORKFLOW AREA

export const createAdminRouter = (options?: { history?: RouterHistory }) => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view




    {
      path: adminLinks.admin.path,
      component: AdminAsync,
    },
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: options?.history ?? createWebHistory("/"),
    routes,
  });
};
