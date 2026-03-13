import {
  filesListRecipesQuery,
  getCollectionsQuery,
  getRecipeQuery,
  listRecipeVersionsQuery,
  membersListCollectionsQuery,
  notesListRecipesQuery,
  recipeNoteFilesGetByNoteIdQuery,
} from "@sderickson/recipes-sdk";
import { getProfile } from "@saflib/auth";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useDetailLoader() {
  const route = useRoute();
  const id = route.params.id as string;
  const collectionId = route.params.collectionId as string;

  return {
    profileQuery: useQuery(getProfile()),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    membersQuery: useQuery(membersListCollectionsQuery(collectionId)),
    recipeQuery: useQuery(getRecipeQuery(id)),
    versionsQuery: useQuery(listRecipeVersionsQuery(id)),
    notesQuery: useQuery(notesListRecipesQuery(id)),
    filesQuery: useQuery(filesListRecipesQuery(id)),
    noteFilesByRecipeQuery: useQuery(recipeNoteFilesGetByNoteIdQuery(id)),
  };
}
