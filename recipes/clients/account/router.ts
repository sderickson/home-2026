import {
  AccountPasswordPageAsync,
  AccountProfilePageAsync,
} from "@saflib/account-sdk/pages";
import { createRouter, createWebHistory } from "vue-router";
import { accountLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import HomeAsync from "./pages/home/HomeAsync.vue";
// END WORKFLOW AREA

export const createAccountRouter = () => {
  const routes = [
    // BEGIN SORTED WORKFLOW AREA page-routes FOR vue/add-view

    {
      path: accountLinks.home.path,
      component: HomeAsync,
    },
    {
      path: accountLinks.password.path,
      component: AccountPasswordPageAsync,
    },
    {
      path: accountLinks.profile.path,
      component: AccountProfilePageAsync,
    },
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: createWebHistory("/"),
    routes,
  });
};
