import { ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  useCreateCollectionsMutation,
  useCreateRecipeMutation,
  useCreateMenuMutation,
  useFilesFromUnsplashRecipesMutation,
  searchUnsplashPhotosQuery,
} from "@sderickson/recipes-sdk";

export function useSeedData(options: { getSuccessMessage: () => string }) {
  const queryClient = useQueryClient();
  const createCollection = useCreateCollectionsMutation();
  const createRecipe = useCreateRecipeMutation();
  const createMenu = useCreateMenuMutation();
  const addFromUnsplash = useFilesFromUnsplashRecipesMutation();

  const seeding = ref(false);
  const seedMessage = ref("");

  async function runSeed() {
    seeding.value = true;
    seedMessage.value = "";
    try {
      const { collection } = await createCollection.mutateAsync({
        name: "Seed Kitchen",
      });
      const collectionId = collection.id;

      const recipes = [
        {
          title: "Simple Pasta",
          subtitle: "Quick weeknight dinner",
          searchQuery: "pasta",
          initialVersion: {
            ingredients: [
              { name: "Pasta", quantity: "400", unit: "g" },
              { name: "Olive oil", quantity: "2", unit: "tbsp" },
              { name: "Garlic", quantity: "2", unit: "cloves" },
            ],
            instructionsMarkdown:
              "Boil pasta. Sauté garlic in oil. Toss and serve.",
          },
        },
        {
          title: "Green Salad",
          subtitle: "Fresh side",
          searchQuery: "green salad",
          initialVersion: {
            ingredients: [
              { name: "Lettuce", quantity: "1", unit: "head" },
              { name: "Cucumber", quantity: "1", unit: "" },
              { name: "Olive oil", quantity: "1", unit: "tbsp" },
            ],
            instructionsMarkdown:
              "Chop vegetables. Dress with oil and season.",
          },
        },
        {
          title: "Scrambled Eggs",
          subtitle: "Classic breakfast",
          searchQuery: "scrambled eggs",
          initialVersion: {
            ingredients: [
              { name: "Eggs", quantity: "4", unit: "" },
              { name: "Butter", quantity: "1", unit: "tbsp" },
            ],
            instructionsMarkdown:
              "Beat eggs. Melt butter in pan. Scramble over low heat.",
          },
        },
        {
          title: "Tomato Soup",
          subtitle: "Comfort in a bowl",
          searchQuery: "tomato soup",
          initialVersion: {
            ingredients: [
              { name: "Canned tomatoes", quantity: "400", unit: "g" },
              { name: "Onion", quantity: "1", unit: "" },
              { name: "Basil", quantity: "few", unit: "leaves" },
            ],
            instructionsMarkdown:
              "Sauté onion. Add tomatoes and basil. Simmer and blend.",
          },
        },
      ];

      const createdRecipes: { id: string }[] = [];
      for (const r of recipes) {
        const result = await createRecipe.mutateAsync({
          collectionId,
          title: r.title,
          subtitle: r.subtitle,
          isPublic: true,
          initialVersion: {
            content: {
              ingredients: r.initialVersion.ingredients,
              instructionsMarkdown: r.initialVersion.instructionsMarkdown,
            },
          },
        });
        createdRecipes.push({ id: result.recipe.id });

        const searchResult = await queryClient.fetchQuery(
          searchUnsplashPhotosQuery({ q: r.searchQuery, perPage: 1 }),
        );
        const photo = searchResult?.unsplashPhotos?.[0];
        if (photo) {
          await addFromUnsplash.mutateAsync({
            recipeId: result.recipe.id,
            unsplashPhotoId: photo.id,
            downloadLocation: photo.downloadLocation,
            imageUrl: photo.regularUrl,
          });
        }
      }

      const [r1, r2, r3, r4] = createdRecipes;

      await createMenu.mutateAsync({
        collectionId,
        name: "Weeknight Dinners",
        isPublic: true,
        groupings: [
          { name: "Mains", recipeIds: [r1.id, r2.id] },
          { name: "Sides", recipeIds: [r2.id] },
        ],
      });
      await createMenu.mutateAsync({
        collectionId,
        name: "Brunch",
        isPublic: false,
        groupings: [{ name: "Mains", recipeIds: [r3.id, r1.id] }],
      });
      await createMenu.mutateAsync({
        collectionId,
        name: "Soups & Sides",
        isPublic: true,
        groupings: [
          { name: "Soups", recipeIds: [r4.id] },
          { name: "Sides", recipeIds: [r2.id] },
        ],
      });

      seedMessage.value = options.getSuccessMessage();
    } catch (e) {
      seedMessage.value = e instanceof Error ? e.message : String(e);
    } finally {
      seeding.value = false;
    }
  }

  return { runSeed, seeding, seedMessage };
}
