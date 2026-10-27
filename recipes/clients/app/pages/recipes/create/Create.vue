<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ t(strings.title) }}</h1>

    <RecipeForm v-model="formModel" @success="handleSuccess">
      <template v-if="menus.length > 0" #after-description>
        <div class="text-subtitle-2 mb-2">
          {{ t(strings.add_to_menu_label) }}
        </div>
        <MenuPlacementPicker
          v-model="menuPlacement"
          :menus="menus"
          allow-none
          class="mb-6"
        />
      </template>
    </RecipeForm>
  </v-container>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@sderickson/recipes-clients-common";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { recipes_create_page as strings } from "./Create.strings.ts";
import { useCreateLoader } from "./Create.loader.ts";
import { assertCreateDataLoaded } from "./Create.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import MenuPlacementPicker from "../../../components/menus/MenuPlacementPicker.vue";
import { useAddRecipeToMenu } from "../../../components/menus/useAddRecipeToMenu.ts";
import {
  isPlacementComplete,
  type MenuPlacement,
} from "../../../components/menus/menuPlacement.logic.ts";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";

const { t } = useReverseT();
const route = useRoute();
const router = useRouter();
const collectionId = route.params.collectionId as string;
const { sessionQuery, collectionQuery, menusQuery } = useCreateLoader();

assertCreateDataLoaded(sessionQuery.data.value);

const collection = computed(() => collectionQuery.data.value?.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);

const formModel = ref<RecipeFormModel>({
  collectionId,
  title: "",
  subtitle: "",
  description: null,
  initialVersion: {
    content: {
      ingredients: [],
      instructionsMarkdown: "",
    },
  },
});

const menus = computed(() => menusQuery.data.value?.menus ?? []);
const menuPlacement = ref<MenuPlacement>({ menuId: null, section: "" });
const { addRecipeToMenu } = useAddRecipeToMenu();

async function handleSuccess(recipeId: string) {
  const placement = menuPlacement.value;
  const menu = menus.value.find((m) => m.id === placement.menuId);
  if (menu && isPlacementComplete(placement)) {
    try {
      await addRecipeToMenu(menu, placement.section, recipeId);
    } catch {
      // The recipe exists either way; the snackbar shows the menu error and
      // the recipe page offers to add it to a menu again.
    }
  }
  router.push(
    constructPath(appLinks.recipesDetail, {
      params: { collectionId, id: recipeId },
    }),
  );
}

useBreadcrumbs(() => [
  { title: collectionName.value, to: collectionDetailPath.value },
  { title: t(strings.breadcrumb_new) },
]);
</script>
