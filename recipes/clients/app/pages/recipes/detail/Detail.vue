<template>
  <div>
    <v-container fluid class="pa-0 pt-md-4" max-width="1040">
      <AddToMenuPrompt
        v-if="canEdit && !recipe.archivedAt"
        :collection-id="collectionId"
        :recipe-id="recipe.id"
      />
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
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertFilesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
} from "./Detail.logic.ts";
import RecipeDetailContent from "../../../components/recipe-detail/RecipeDetailContent.vue";
import AddToMenuPrompt from "./AddToMenuPrompt.vue";
import { useScreenWakeLock } from "../../../composables/useScreenWakeLock.ts";

useScreenWakeLock();

const route = useRoute();
const collectionId = route.params.collectionId as string;

const queries = useDetailLoader();

assertRecipeLoaded(queries.recipeQuery.data.value);
assertProfileLoaded(queries.sessionQuery.data.value);
assertVersionsLoaded(queries.versionsQuery.data.value);
assertFilesLoaded(queries.filesQuery.data.value);

const recipe = computed(() => queries.recipeQuery.data.value!.recipe);
const currentVersion = computed(
  () => queries.recipeQuery.data.value!.currentVersion ?? null,
);
const collection = computed(
  () => queries.collectionQuery.data.value?.collection,
);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => queries.membersQuery.data.value?.members ?? []);
const userEmail = computed(
  () => kratosEmailFromSession(queries.sessionQuery.data.value) ?? "",
);
const canEdit = computed(() => {
  const role = members.value.find((m) => m.email === userEmail.value)?.role;
  return role === "editor" || role === "owner";
});
const versions = computed(
  () => queries.versionsQuery.data.value?.recipeVersions ?? [],
);
const files = computed(() => queries.filesQuery.data.value?.files ?? []);

const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);

useBreadcrumbs(() => [
  { title: collectionName.value, to: collectionDetailPath.value },
  { title: recipe.value.title },
]);
</script>
