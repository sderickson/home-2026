import { ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  useDeleteCollectionsMutation,
  useDeleteMenuMutation,
  useDeleteRecipeMutation,
  listCollectionsQuery,
  listMenusQuery,
  listRecipesQuery,
} from "@sderickson/recipes-sdk";
import { SEED_COLLECTION_NAME } from "./seed-recipes.ts";

export function useCleanupSeedData(options: {
  getSuccessMessage: () => string;
  getNotFoundMessage: () => string;
}) {
  const queryClient = useQueryClient();
  const deleteCollection = useDeleteCollectionsMutation();
  const deleteMenu = useDeleteMenuMutation();
  const deleteRecipe = useDeleteRecipeMutation();

  const cleaning = ref(false);
  const cleanupMessage = ref("");
  const progress = ref(0);
  const statusMessage = ref("");

  async function runCleanup() {
    cleaning.value = true;
    cleanupMessage.value = "";
    progress.value = 0;
    statusMessage.value = "";

    try {
      statusMessage.value = "Finding Seed Kitchen collection…";
      const collectionsData = await queryClient.fetchQuery(listCollectionsQuery());
      const seedCollection = collectionsData?.collections?.find(
        (c) => c.name === SEED_COLLECTION_NAME,
      );
      if (!seedCollection) {
        cleanupMessage.value = options.getNotFoundMessage();
        cleaning.value = false;
        return;
      }
      const collectionId = seedCollection.id;

      progress.value = 5;

      statusMessage.value = "Loading menus and recipes…";
      const [menusData, recipesData] = await Promise.all([
        queryClient.fetchQuery(listMenusQuery(collectionId)),
        queryClient.fetchQuery(listRecipesQuery(collectionId)),
      ]);
      const menus = menusData?.menus ?? [];
      const recipes = recipesData?.recipes ?? [];

      const totalSteps = menus.length + recipes.length + 1;
      let step = 0;

      function updateProgress(status: string) {
        step += 1;
        progress.value = Math.round(5 + (step / totalSteps) * 90);
        statusMessage.value = status;
      }

      for (const menu of menus) {
        updateProgress(`Deleting menu: ${menu.name}…`);
        await deleteMenu.mutateAsync({
          id: menu.id,
          collectionId: menu.collectionId,
        });
      }

      for (const recipe of recipes) {
        updateProgress(`Deleting recipe: ${recipe.title}…`);
        await deleteRecipe.mutateAsync(recipe.id);
      }

      updateProgress("Deleting collection…");
      await deleteCollection.mutateAsync(collectionId);

      progress.value = 100;
      statusMessage.value = "";
      cleanupMessage.value = options.getSuccessMessage();
    } catch (e) {
      cleanupMessage.value = e instanceof Error ? e.message : String(e);
      statusMessage.value = "";
    } finally {
      cleaning.value = false;
    }
  }

  return { runCleanup, cleaning, cleanupMessage, progress, statusMessage };
}
