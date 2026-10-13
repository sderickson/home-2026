<template>
  <div>
    <v-container fluid class="pa-0 pt-md-4" max-width="1040">
      <RecipeDetailContent
        :recipe="recipe"
        :current-version="currentVersion"
        :collection-id="collectionId"
        :members="members"
        :user-email="userEmail"
        :versions="versions"
        :files="files"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@sderickson/recipes-clients-common";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { kratosEmailFromSession } from "@saflib/ory-kratos-sdk";
import RecipeDetailContent from "../../../components/recipe-detail/RecipeDetailContent.vue";
import {
  assertFilesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
} from "../../../components/recipe-detail/recipeDetailLogic.ts";
import { useMenuRecipeDetailLoader } from "./RecipeDetail.loader.ts";

const route = useRoute();
const collectionId = route.params.collectionId as string;
const menuId = route.params.menuId as string;

const loaderResult = useMenuRecipeDetailLoader();
const { menuQuery, ...queries } = loaderResult;

assertRecipeLoaded(queries.recipeQuery.data.value);
assertProfileLoaded(queries.sessionQuery.data.value);
assertVersionsLoaded(queries.versionsQuery.data.value);
assertFilesLoaded(queries.filesQuery.data.value);

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
const userEmail = computed(
  () => kratosEmailFromSession(queries.sessionQuery.data.value) ?? "",
);
const versions = computed(() => queries.versionsQuery.data.value ?? []);
const files = computed(() => queries.filesQuery.data.value ?? []);

const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);
const menuDetailPath = computed(() =>
  constructPath(appLinks.menusDetail, { params: { collectionId, id: menuId } }),
);

useBreadcrumbs(() => [
  { title: collectionName.value, to: collectionDetailPath.value },
  { title: menu.value.name, to: menuDetailPath.value },
  { title: recipe.value.title },
]);
</script>
