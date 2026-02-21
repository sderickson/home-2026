import { createRouter, createWebHistory } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";

// TODO: remove this log once appLinks is being used by the routes
console.log("appLinks:", appLinks);

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import HomeAsync from "./pages/home/HomeAsync.vue";
import RecipesCreateAsync from "./pages/recipes/create/CreateAsync.vue";
import RecipesDetailAsync from "./pages/recipes/detail/DetailAsync.vue";
import RecipesListAsync from "./pages/recipes/list/ListAsync.vue";
// END WORKFLOW AREA

export const createAppRouter = () => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view




    {
      path: appLinks.home.path,
      component: HomeAsync,
    },
    {
      path: appLinks.recipesList.path,
      component: RecipesListAsync,
    },
    {
      path: appLinks.recipesDetail.path,
      component: RecipesDetailAsync,
    },
    {
      path: appLinks.recipesCreate.path,
      component: RecipesCreateAsync,
    },
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: createWebHistory("/"),
    routes,
  });
};
