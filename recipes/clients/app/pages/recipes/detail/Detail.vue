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
import { kratosEmailFromSession } from "@saflib/ory-kratos-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertFilesLoaded,
  assertNotesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
} from "./Detail.logic.ts";
import RecipeDetailContent from "../../../components/recipe-detail/RecipeDetailContent.vue";
import { recipes_detail_page as strings } from "./Detail.strings.ts";

const { t } = useReverseT();
const route = useRoute();
const collectionId = route.params.collectionId as string;

const queries = useDetailLoader();

assertRecipeLoaded(queries.recipeQuery.data.value);
assertProfileLoaded(queries.sessionQuery.data.value);
assertVersionsLoaded(queries.versionsQuery.data.value);
assertNotesLoaded(queries.notesQuery.data.value);
assertFilesLoaded(queries.filesQuery.data.value);
assertNoteFilesByRecipeLoaded(queries.noteFilesByRecipeQuery.data.value);

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
const versions = computed(() => queries.versionsQuery.data.value ?? []);
const notes = computed(() => queries.notesQuery.data.value ?? []);
const files = computed(() => queries.filesQuery.data.value ?? []);
const noteFilesByRecipe = computed(
  () => queries.noteFilesByRecipeQuery.data.value ?? [],
);

const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);
const recipeDetailPath = computed(() =>
  constructPath(appLinks.recipesDetail, {
    params: { collectionId, id: recipe.value.id },
  }),
);
</script>
