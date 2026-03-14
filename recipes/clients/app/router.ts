import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import CollectionLayout from "./layouts/CollectionLayout.vue";
import CollectionsDetailAsync from "./pages/collections/detail/DetailAsync.vue";
import HomeAsync from "./pages/home/HomeAsync.vue";
import MenuRecipeDetailAsync from "./pages/menus/detail/RecipeDetailAsync.vue";
import MenusCreateAsync from "./pages/menus/create/CreateAsync.vue";
import MenusDetailAsync from "./pages/menus/detail/DetailAsync.vue";
import RecipesCreateAsync from "./pages/recipes/create/CreateAsync.vue";
import RecipesDetailAsync from "./pages/recipes/detail/DetailAsync.vue";
import RecipesEditAsync from "./pages/recipes/edit/EditAsync.vue";
// END WORKFLOW AREA

export const createAppRouter = (options?: { history?: RouterHistory }) => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view

    {
      path: appLinks.home.path,
      component: HomeAsync,
    },
    {
      path: "/c/:collectionId",
      component: CollectionLayout,
      children: [
        {
          path: "",
          component: CollectionsDetailAsync,
        },
        {
          path: "recipes/create",
          component: RecipesCreateAsync,
        },
        {
          path: "recipes/:id",
          component: RecipesDetailAsync,
        },
        {
          path: "recipes/:id/edit",
          component: RecipesEditAsync,
        },
        {
          path: "menus/create",
          component: MenusCreateAsync,
        },
        {
          path: "menus/:menuId/recipes/:recipeId",
          component: MenuRecipeDetailAsync,
        },
        {
          path: "menus/:id",
          component: MenusDetailAsync,
        },
      ],
    },
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: options?.history ?? createWebHistory("/"),
    routes,
  });
};
