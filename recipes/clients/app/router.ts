import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
import CollectionLayout from "./layouts/CollectionLayout.vue";
import CollectionsListAsync from "./pages/collections/list/ListAsync.vue";
import HomeAsync from "./pages/home/HomeAsync.vue";
import MenusListAsync from "./pages/menus/list/ListAsync.vue";
import RecipesCreateAsync from "./pages/recipes/create/CreateAsync.vue";
import RecipesDetailAsync from "./pages/recipes/detail/DetailAsync.vue";
import RecipesEditAsync from "./pages/recipes/edit/EditAsync.vue";
import RecipesListAsync from "./pages/recipes/list/ListAsync.vue";
// END WORKFLOW AREA

export const createAppRouter = (options?: { history?: RouterHistory }) => {
  const routes = [
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view

    {
      path: appLinks.home.path,
      component: HomeAsync,
    },
    {
      path: appLinks.collectionsList.path,
      component: CollectionsListAsync,
    },
    {
      path: "/c/:collectionId",
      component: CollectionLayout,
      children: [
        {
          path: "recipes/list",
          component: RecipesListAsync,
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
          path: "menus/list",
          component: MenusListAsync,
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
