<template>
  <div>
    <v-container fluid class="pa-0">
      <v-breadcrumbs class="pl-0 mb-2">
        <v-breadcrumbs-item :to="appLinks.home.path">
          {{ t(strings.breadcrumb_home) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="collectionDetailPath">
          {{ collectionName }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="collectionDetailPath">
          {{ t(strings.breadcrumb_menus) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="menuDetailPath">
          {{ menu.name }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="recipeDetailPath">
          {{ recipe.title }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>

      <RecipeDetailContent
        :recipe="recipe"
        :current-version="currentVersion"
        :collection-id="collectionId"
        :members="members"
        :user-email="userEmail"
        :versions="versions"
        :notes="notes"
        :files="files"
        :note-files-by-recipe="noteFilesByRecipe"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import RecipeDetailContent from "../../../components/recipe-detail/RecipeDetailContent.vue";
import {
  assertFilesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertNotesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
} from "../../../components/recipe-detail/recipeDetailLogic.ts";
import { useMenuRecipeDetailLoader } from "./RecipeDetail.loader.ts";
import { menus_recipe_detail as strings } from "./RecipeDetail.strings.ts";

const { t } = useReverseT();
const route = useRoute();
const collectionId = route.params.collectionId as string;
const menuId = route.params.menuId as string;

const loaderResult = useMenuRecipeDetailLoader();
const { menuQuery, ...queries } = loaderResult;

assertRecipeLoaded(queries.recipeQuery.data.value);
assertProfileLoaded(queries.profileQuery.data.value);
assertVersionsLoaded(queries.versionsQuery.data.value);
assertNotesLoaded(queries.notesQuery.data.value);
assertFilesLoaded(queries.filesQuery.data.value);
assertNoteFilesByRecipeLoaded(queries.noteFilesByRecipeQuery.data.value);

const menuData = computed(() => menuQuery.data.value);
if (!menuData.value?.menu) {
  throw new Error("Failed to load menu");
}

const recipe = computed(() => queries.recipeQuery.data.value!.recipe);
const currentVersion = computed(
  () => queries.recipeQuery.data.value!.currentVersion ?? null,
);
const menu = computed(() => menuData.value!.menu);
const collection = computed(
  () => queries.collectionQuery.data.value?.collection,
);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => queries.membersQuery.data.value?.members ?? []);
const userEmail = computed(() => queries.profileQuery.data.value?.email ?? "");
const versions = computed(() => queries.versionsQuery.data.value ?? []);
const notes = computed(() => queries.notesQuery.data.value ?? []);
const files = computed(() => queries.filesQuery.data.value ?? []);
const noteFilesByRecipe = computed(
  () => queries.noteFilesByRecipeQuery.data.value ?? [],
);

const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);
const menuDetailPath = computed(() =>
  constructPath(appLinks.menusDetail, { params: { collectionId, id: menuId } }),
);
const recipeDetailPath = computed(() =>
  constructPath(appLinks.menuRecipeDetail, {
    params: { collectionId, menuId, recipeId: recipe.value.id },
  }),
);
</script>
