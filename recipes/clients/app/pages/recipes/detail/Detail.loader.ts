import { kratosSessionRequiredQueryOptions } from "@saflib/ory-kratos-sdk";
import {
  filesListRecipesQuery,
  getCollectionsQuery,
  getRecipeQuery,
  listRecipeVersionsQuery,
  membersListCollectionsQuery,
  notesListRecipesQuery,
  recipeNoteFilesGetByNoteIdQuery,
} from "@sderickson/recipes-sdk";
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
    sessionQuery: useQuery(kratosSessionRequiredQueryOptions()),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    membersQuery: useQuery(membersListCollectionsQuery(collectionId)),
    recipeQuery: useQuery(getRecipeQuery(recipeId)),
    versionsQuery: useQuery(listRecipeVersionsQuery(recipeId)),
    notesQuery: useQuery(notesListRecipesQuery(recipeId)),
    filesQuery: useQuery(filesListRecipesQuery(recipeId)),
    noteFilesByRecipeQuery: useQuery(recipeNoteFilesGetByNoteIdQuery(recipeId)),
  };
}
