import { ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  useCreateCollectionsMutation,
  useCreateRecipeMutation,
  useCreateMenuMutation,
  useFilesFromUnsplashRecipesMutation,
  searchUnsplashPhotosQuery,
} from "@sderickson/recipes-sdk";
import { SEED_RECIPES, SEED_COLLECTION_NAME } from "./seed-recipes.ts";

function isUnsplashRateLimitError(e: unknown): boolean {
  if (e && typeof e === "object") {
    const o = e as { status?: number; code?: string };
    return o.status === 429 || o.code === "UNSPLASH_RATE_LIMIT";
  }
  return false;
}

export function useSeedData(options: { getSuccessMessage: () => string }) {
  const queryClient = useQueryClient();
  const createCollection = useCreateCollectionsMutation();
  const createRecipe = useCreateRecipeMutation();
  const createMenu = useCreateMenuMutation();
  const addFromUnsplash = useFilesFromUnsplashRecipesMutation();

  const seeding = ref(false);
  const seedMessage = ref("");
  const progress = ref(0);
  const statusMessage = ref("");

  async function runSeed() {
    seeding.value = true;
    seedMessage.value = "";
    progress.value = 0;
    statusMessage.value = "";

    const totalRecipes = SEED_RECIPES.length;
    const totalMenus = 4; // Weeknight Dinners, Brunch, Soups & Sides, Holiday Feast
    const totalSteps = 1 + totalRecipes * 2 + totalMenus; // collection + (create + unsplash) per recipe + menus
    let step = 0;

    function updateProgress(status: string) {
      step += 1;
      progress.value = Math.round((step / totalSteps) * 100);
      statusMessage.value = status;
    }

    try {
      updateProgress("Creating collection…");
      const { collection } = await createCollection.mutateAsync({
        name: SEED_COLLECTION_NAME,
      });
      const collectionId = collection.id;

      const createdRecipes: { id: string }[] = [];
      for (let i = 0; i < SEED_RECIPES.length; i++) {
        const r = SEED_RECIPES[i];
        updateProgress(`Creating recipe: ${r.title}…`);
        const result = await createRecipe.mutateAsync({
          collectionId,
          title: r.title,
          subtitle: r.subtitle,
          isPublic: true,
          initialVersion: {
            content: {
              ingredients: [...r.initialVersion.ingredients],
              instructionsMarkdown: r.initialVersion.instructionsMarkdown,
            },
          },
        });
        createdRecipes.push({ id: result.recipe.id });

        updateProgress(`Adding image for ${r.title}…`);
        let photo: { id: string; downloadLocation: string; regularUrl: string } | null = null;
        try {
          const searchResult = await queryClient.fetchQuery(
            searchUnsplashPhotosQuery({ q: r.searchQuery, perPage: 1 }),
          );
          photo = searchResult?.unsplashPhotos?.[0] ?? null;
        } catch (e) {
          if (!isUnsplashRateLimitError(e)) throw e;
        }
        if (photo) {
          try {
            await addFromUnsplash.mutateAsync({
              recipeId: result.recipe.id,
              unsplashPhotoId: photo.id,
              downloadLocation: photo.downloadLocation,
              imageUrl: photo.regularUrl,
            });
          } catch (e) {
            if (!isUnsplashRateLimitError(e)) throw e;
          }
        }
      }

      const [r1, r2, r3, r4] = [createdRecipes[0], createdRecipes[1], createdRecipes[2], createdRecipes[3]];
      const roastChicken = createdRecipes[22];
      const mashedPotatoes = createdRecipes[12];
      const garlicBread = createdRecipes[4];
      const roastedVeg = createdRecipes[8];

      updateProgress("Creating menu: Weeknight Dinners…");
      await createMenu.mutateAsync({
        collectionId,
        name: "Weeknight Dinners",
        isPublic: true,
        groupings: [
          { name: "Mains", recipeIds: [r1.id, r2.id] },
          { name: "Sides", recipeIds: [r2.id] },
        ],
      });

      updateProgress("Creating menu: Brunch…");
      await createMenu.mutateAsync({
        collectionId,
        name: "Brunch",
        isPublic: false,
        groupings: [{ name: "Mains", recipeIds: [r3.id, r1.id] }],
      });

      updateProgress("Creating menu: Soups & Sides…");
      await createMenu.mutateAsync({
        collectionId,
        name: "Soups & Sides",
        isPublic: true,
        groupings: [
          { name: "Soups", recipeIds: [r4.id] },
          { name: "Sides", recipeIds: [r2.id] },
        ],
      });

      updateProgress("Creating menu: Holiday Feast…");
      await createMenu.mutateAsync({
        collectionId,
        name: "Holiday Feast",
        isPublic: true,
        groupings: [
          { name: "Mains", recipeIds: [roastChicken.id, roastedVeg.id] },
          { name: "Sides", recipeIds: [mashedPotatoes.id, r2.id, garlicBread.id] },
          { name: "Soups", recipeIds: [r4.id] },
        ],
      });

      progress.value = 100;
      statusMessage.value = "";
      seedMessage.value = options.getSuccessMessage();
    } catch (e) {
      seedMessage.value = e instanceof Error ? e.message : String(e);
      statusMessage.value = "";
    } finally {
      seeding.value = false;
    }
  }

  return { runSeed, seeding, seedMessage, progress, statusMessage };
}
