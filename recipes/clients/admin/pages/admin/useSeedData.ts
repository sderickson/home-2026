import { ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  useCreateCollectionsMutation,
  useCreateRecipeMutation,
  useCreateMenuMutation,
  useFilesFromUnsplashRecipesMutation,
  searchUnsplashPhotosQuery,
  listCollectionsQuery,
  listRecipesQuery,
  listMenusQuery,
  filesListRecipesQuery,
} from "@sderickson/recipes-sdk";
import { SEED_RECIPES, SEED_COLLECTION_NAME } from "./seed-recipes.ts";

function isUnsplashRateLimitError(e: unknown): boolean {
  if (e && typeof e === "object") {
    const o = e as { status?: number; code?: string };
    return o.status === 429 || o.code === "UNSPLASH_RATE_LIMIT";
  }
  return false;
}

const SEED_MENU_NAMES = [
  "Weeknight Dinners",
  "Brunch",
  "Soups & Sides",
  "Holiday Feast",
] as const;

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
    const totalMenus = SEED_MENU_NAMES.length;
    const totalSteps = 1 + totalRecipes * 2 + totalMenus;
    let step = 0;

    function updateProgress(status: string) {
      step += 1;
      progress.value = Math.round((step / totalSteps) * 100);
      statusMessage.value = status;
    }

    try {
      updateProgress("Finding or creating collection…");
      const collectionsData = await queryClient.fetchQuery(listCollectionsQuery());
      const collections = collectionsData?.collections ?? [];
      let seedCollection = collections.find(
        (c: { name?: string }) => c.name === SEED_COLLECTION_NAME,
      );
      if (!seedCollection) {
        const { collection } = await createCollection.mutateAsync({
          name: SEED_COLLECTION_NAME,
        });
        seedCollection = collection;
      }
      const collectionId = seedCollection.id;

      const existingRecipesRaw = await queryClient.fetchQuery(
        listRecipesQuery(collectionId),
      );
      const existingRecipesList = Array.isArray(existingRecipesRaw)
        ? existingRecipesRaw
        : [];
      const byTitle = new Map<string, { id: string }>();
      for (const recipe of existingRecipesList) {
        const title = (recipe as { title?: string }).title;
        if (title && !byTitle.has(title)) byTitle.set(title, { id: (recipe as { id: string }).id });
      }

      const createdRecipes: { id: string }[] = [];
      for (let i = 0; i < SEED_RECIPES.length; i++) {
        const r = SEED_RECIPES[i];
        let recipeId: string;
        const existing = byTitle.get(r.title);
        if (existing) {
          updateProgress(`Using existing recipe: ${r.title}…`);
          recipeId = existing.id;
        } else {
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
          recipeId = result.recipe.id;
          byTitle.set(r.title, { id: recipeId });
        }
        createdRecipes.push({ id: recipeId });

        updateProgress(`Adding image for ${r.title}…`);
        let hasImage = false;
        try {
          const files = await queryClient.fetchQuery(
            filesListRecipesQuery(recipeId),
          );
          hasImage = Array.isArray(files) && files.length > 0;
        } catch {
          // ignore list errors; we'll try to add image
        }
        if (!hasImage) {
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
                recipeId,
                unsplashPhotoId: photo.id,
                downloadLocation: photo.downloadLocation,
                imageUrl: photo.regularUrl,
              });
            } catch (e) {
              if (!isUnsplashRateLimitError(e)) throw e;
            }
          }
        }
      }

      const existingMenusData = await queryClient.fetchQuery(
        listMenusQuery(collectionId),
      );
      const existingMenus = existingMenusData?.menus ?? [];
      const existingMenuNames = new Set(
        existingMenus.map((m: { name?: string }) => m.name),
      );

      const [r1, r2, r3, r4] = [createdRecipes[0], createdRecipes[1], createdRecipes[2], createdRecipes[3]];
      const roastChicken = createdRecipes[22];
      const mashedPotatoes = createdRecipes[12];
      const garlicBread = createdRecipes[4];
      const roastedVeg = createdRecipes[8];

      const menuPayloads: { name: string; isPublic: boolean; groupings: { name: string; recipeIds: string[] }[] }[] = [
        {
          name: "Weeknight Dinners",
          isPublic: true,
          groupings: [
            { name: "Mains", recipeIds: [r1.id, r2.id] },
            { name: "Sides", recipeIds: [r2.id] },
          ],
        },
        {
          name: "Brunch",
          isPublic: false,
          groupings: [{ name: "Mains", recipeIds: [r3.id, r1.id] }],
        },
        {
          name: "Soups & Sides",
          isPublic: true,
          groupings: [
            { name: "Soups", recipeIds: [r4.id] },
            { name: "Sides", recipeIds: [r2.id] },
          ],
        },
        {
          name: "Holiday Feast",
          isPublic: true,
          groupings: [
            { name: "Mains", recipeIds: [roastChicken.id, roastedVeg.id] },
            { name: "Sides", recipeIds: [mashedPotatoes.id, r2.id, garlicBread.id] },
            { name: "Soups", recipeIds: [r4.id] },
          ],
        },
      ];

      for (const payload of menuPayloads) {
        if (existingMenuNames.has(payload.name)) {
          updateProgress(`Skipping existing menu: ${payload.name}`);
        } else {
          updateProgress(`Creating menu: ${payload.name}…`);
          await createMenu.mutateAsync({
            collectionId,
            name: payload.name,
            isPublic: payload.isPublic,
            groupings: payload.groupings,
          });
        }
      }

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
