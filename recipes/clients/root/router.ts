import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { rootLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import HomeAsync from "./pages/home/HomeAsync.vue";
import RecipesDetailAsync from "./pages/recipes/detail/DetailAsync.vue";
import RecipesListAsync from "./pages/recipes/list/ListAsync.vue";
// END WORKFLOW AREA

export const createRootRouter = (options?: { history?: RouterHistory }) => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view

    {
      path: rootLinks.home.path,
      component: HomeAsync,
    },
    {
      path: rootLinks.recipesList.path,
      component: RecipesListAsync,
    },
    {
      path: rootLinks.recipesDetail.path,
      component: RecipesDetailAsync,
    },
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: options?.history ?? createWebHistory("/"),
    routes,
  });
};
