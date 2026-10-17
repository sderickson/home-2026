import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { getCollectionsQuery } from "@sderickson/recipes-sdk/requests/collections/get";
import { membersListCollectionsQuery } from "@sderickson/recipes-sdk/requests/collections/members-list";
import { filesListRecipesQuery } from "@sderickson/recipes-sdk/requests/recipes/files-list";
import { getRecipeQuery } from "@sderickson/recipes-sdk/requests/recipes/get";
import { listRecipeVersionsQuery } from "@sderickson/recipes-sdk/requests/recipes/versions-list";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export type RecipeDetailLoaderParams = {
  recipeId: string;
  collectionId: string;
};

/** Load recipe detail data. Uses route params when no params passed (standalone recipe page). */
export function useDetailLoader(params?: RecipeDetailLoaderParams) {
  const route = useRoute();
  const recipeId = params?.recipeId ?? (route.params.id as string);
  const collectionId =
    params?.collectionId ?? (route.params.collectionId as string);

  return {
    sessionQuery: useKratosSession(),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    membersQuery: useQuery(membersListCollectionsQuery(collectionId)),
    recipeQuery: useQuery(getRecipeQuery(recipeId)),
    versionsQuery: useQuery(listRecipeVersionsQuery(recipeId)),
    filesQuery: useQuery(filesListRecipesQuery(recipeId)),
  };
}
